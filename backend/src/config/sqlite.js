const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path - use environment variable if available (for Docker)
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'monitoring.db');

// Ensure logs directory exists
const logDir = path.dirname(dbPath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Initialize SQLite database with options
const db = new Database(dbPath, {
  timeout: 5000, // Wait up to 5 seconds if database is locked
  fileMustExist: false
});

// SQLite configuration for different environments
let useWAL = true;

// Docker/production on Windows bind mounts does NOT support WAL mode (SQLITE_IOERR_SHMOPEN)
// Force DELETE mode in Docker to avoid crashes
const isDocker = process.env.NODE_ENV === 'production' || fs.existsSync('/.dockerenv');

if (isDocker) {
  // Force DELETE mode for Docker bind mounts (WAL shared memory files don't work)
  try {
    db.pragma('journal_mode = DELETE');
    db.pragma('synchronous = FULL');
    useWAL = false;
    console.log('✅ SQLite: DELETE mode enabled (Docker/production - bind mount safe).');
  } catch (err) {
    console.error('❌ SQLite: Failed to set DELETE journal mode:', err.message);
  }
} else {
  // Local development - try WAL mode for better performance
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    console.log('✅ SQLite: WAL mode enabled with NORMAL sync (development).');
  } catch (err) {
    useWAL = false;
    console.warn('⚠️  SQLite: WAL mode failed, falling back to DELETE mode.');
    try {
      db.pragma('journal_mode = DELETE');
      db.pragma('synchronous = FULL');
      console.log('✅ SQLite: DELETE mode enabled with FULL sync.');
    } catch (fallbackErr) {
      console.error('❌ SQLite: Failed to set journaling mode:', fallbackErr.message);
    }
  }
}

// Common pragmas
db.pragma('busy_timeout = 5000');
db.pragma('cache_size = -64000'); // 64MB cache

// Helper function to retry database operations on lock with sleep between retries
const retryOnLock = (operation, maxRetries = 3, delayMs = 50) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error;
      if (
        error.message.includes('database is locked') &&
        attempt < maxRetries
      ) {
        // Use actual sleep instead of busy wait to reduce CPU usage
        const waitTime = delayMs * Math.pow(2, attempt - 1);
        console.warn(
          `⏳ Database locked, retry ${attempt}/${maxRetries -
          1} in ${waitTime}ms`
        );
        // Sleep using synchronous approach (blocking but necessary for sync operations)
        const deadline = Date.now() + waitTime;
        while (Date.now() < deadline) { }
        continue;
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

// Create tables
const initDatabase = () => {
  // API Requests Table - Stores all incoming requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      ip TEXT NOT NULL,
      method TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      status INTEGER NOT NULL,
      device TEXT,
      source TEXT,
      bytes INTEGER DEFAULT 0,
      ai_decision TEXT DEFAULT 'Allowed',
      response_time INTEGER,
      user_agent TEXT,
      user_email TEXT,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Metrics Table - Stores aggregated metrics
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      timestamp TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // System Logs Table - Stores system events and errors
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT,
      timestamp TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Dashboard Users Table - Stores dashboard user authentication data
  db.exec(`
    CREATE TABLE IF NOT EXISTS "dashboard-user" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // AI Policies Table - Stores AI decisions
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      cpu_usage REAL,
      memory_usage REAL,
      request_count INTEGER,
      error_rate REAL,
      recommended_server TEXT,
      confidence REAL,
      algorithm TEXT,
      rf_recommendation TEXT,
      rf_confidence REAL,
      is_anomaly BOOLEAN,
      threat_level TEXT,
      predicted_load REAL,
      scaling_action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_requests_timestamp ON api_requests(timestamp);
    CREATE INDEX IF NOT EXISTS idx_requests_ip ON api_requests(ip);
    CREATE INDEX IF NOT EXISTS idx_requests_endpoint ON api_requests(endpoint);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON api_requests(status);
    CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_dashboard_user_email ON "dashboard-user"(email);
    CREATE INDEX IF NOT EXISTS idx_dashboard_user_created_at ON "dashboard-user"(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_policies_timestamp ON ai_policies(timestamp);
  `);

  console.log('✅ SQLite Database initialized successfully');
  console.log(`📁 Database location: ${dbPath}`);
};

// Initialize database on require
initDatabase();

// Prepared statements for better performance
const insertRequest = db.prepare(`
  INSERT INTO api_requests (
    timestamp, ip, method, endpoint, status, device, source, bytes, ai_decision, response_time, user_agent, user_email, user_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMetric = db.prepare(`
  INSERT INTO metrics (metric_name, metric_value, timestamp)
  VALUES (?, ?, ?)
`);

const insertLog = db.prepare(`
  INSERT INTO system_logs (level, message, metadata, timestamp)
  VALUES (?, ?, ?, ?)
`);

const insertUser = db.prepare(`
  INSERT INTO "dashboard-user" (name, email, password, role)
  VALUES (?, ?, ?, ?)
`);

const updateUserLastLogin = db.prepare(`
  UPDATE "dashboard-user" SET last_login = CURRENT_TIMESTAMP WHERE id = ?
`);

const insertAiPolicy = db.prepare(`
  INSERT INTO ai_policies (
    timestamp, cpu_usage, memory_usage, request_count, error_rate, 
    recommended_server, confidence, algorithm, 
    rf_recommendation, rf_confidence,
    is_anomaly, threat_level, 
    predicted_load, scaling_action
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Helper functions
const saveAiPolicy = data => {
  try {
    return retryOnLock(
      () =>
        insertAiPolicy.run(
          data.timestamp || new Date().toISOString(),
          data.cpuUsage || 0,
          data.memoryUsage || 0,
          data.requestCount || 0,
          data.errorRate || 0,
          data.recommendedServer || 'server_0',
          data.confidence || 0,
          data.algorithm || 'Unknown',
          data.rfRecommendation || 'Unknown',
          data.rfConfidence || 0,
          data.isAnomaly ? 1 : 0,
          data.threatLevel || 'Low',
          data.predictedLoad || 0,
          data.scalingAction || 'Stable'
        ),
      5,
      50
    );
  } catch (error) {
    console.error('❌ Error saving AI Policy to SQLite:', error.message);
  }
};

const saveRequest = data => {
  try {
    return retryOnLock(
      () =>
        insertRequest.run(
          data.timestamp || new Date().toISOString(),
          data.ip || 'unknown',
          data.method || 'GET',
          data.endpoint || '/',
          data.status || 200,
          data.device || 'Unknown',
          data.source || 'Direct',
          data.bytes || 0,
          data.ai_decision || 'Allowed',
          data.response_time || 0,
          data.user_agent || '',
          data.user_email || null,
          data.user_id || null
        ),
      5,
      50
    );
  } catch (error) {
    console.error('❌ Error saving request to SQLite:', error.message);
  }
};

const saveMetric = (name, value, timestamp = new Date().toISOString()) => {
  try {
    return retryOnLock(() => insertMetric.run(name, value, timestamp), 5, 50);
  } catch (error) {
    console.error('❌ Error saving metric to SQLite:', error.message);
  }
};

// Batch save multiple metrics in a single transaction to reduce lock contention
const saveBatchMetrics = metrics => {
  try {
    return retryOnLock(
      () => {
        // Use transaction to batch all metrics into single write
        const insertStmt = db.prepare(`
        INSERT INTO metrics (metric_name, metric_value, timestamp)
        VALUES (?, ?, ?)
      `);

        const transaction = db.transaction(data => {
          for (const metric of data) {
            insertStmt.run(
              metric.name,
              metric.value,
              metric.timestamp || new Date().toISOString()
            );
          }
        });

        return transaction(metrics);
      },
      5,
      50
    );
  } catch (error) {
    console.error('❌ Error saving batch metrics to SQLite:', error.message);
  }
};

const saveLog = (
  level,
  message,
  metadata = null,
  timestamp = new Date().toISOString()
) => {
  try {
    const metadataStr = metadata ? JSON.stringify(metadata) : null;
    return retryOnLock(
      () => insertLog.run(level, message, metadataStr, timestamp),
      5,
      50
    );
  } catch (error) {
    console.error('❌ Error saving log to SQLite:', error.message);
  }
};

// Query functions
const getRecentRequests = (limit = 100) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM api_requests 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  } catch (error) {
    console.error('❌ Error fetching requests:', error.message);
    return [];
  }
};

const getRequestsByTimeRange = (startTime, endTime) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM api_requests 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(startTime, endTime);
  } catch (error) {
    console.error('❌ Error fetching requests by time range:', error.message);
    return [];
  }
};

const getMetricsByTimeRange = (startTime, endTime) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM metrics 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(startTime, endTime);
  } catch (error) {
    console.error('❌ Error fetching metrics:', error.message);
    return [];
  }
};

const getSystemLogs = (limit = 100) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM system_logs 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  } catch (error) {
    console.error('❌ Error fetching system logs:', error.message);
    return [];
  }
};

// Statistics functions
const getStats = () => {
  try {
    const stats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(DISTINCT ip) as unique_visitors,
        SUM(bytes) as total_bytes,
        AVG(response_time) as avg_response_time,
        SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as error_count,
        SUM(CASE WHEN status >= 200 AND status < 300 THEN 1 ELSE 0 END) as success_count
      FROM api_requests
      WHERE timestamp >= datetime('now', '-1 hour')
    `
      )
      .get();
    return stats;
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
    return {};
  }
};

const getServerDistribution = () => {
  try {
    const stmt = db.prepare(`
      SELECT ai_decision as name, COUNT(*) as value
      FROM api_requests
      WHERE timestamp >= datetime('now', '-1 hour')
      AND ai_decision IS NOT NULL
      GROUP BY ai_decision
    `);
    return stmt.all();
  } catch (error) {
    console.error('❌ Error fetching server distribution:', error.message);
    return [];
  }
};

// Cleanup old data (optional - call periodically)
const cleanupOldData = (daysToKeep = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString();

    const deleteRequests = db.prepare(
      `DELETE FROM api_requests WHERE timestamp < ?`
    );
    const deleteMetrics = db.prepare(`DELETE FROM metrics WHERE timestamp < ?`);
    const deleteLogs = db.prepare(
      `DELETE FROM system_logs WHERE timestamp < ?`
    );

    const reqResult = deleteRequests.run(cutoffStr);
    const metResult = deleteMetrics.run(cutoffStr);
    const logResult = deleteLogs.run(cutoffStr);

    console.log(
      `🧹 Cleanup: Removed ${reqResult.changes} requests, ${metResult.changes
      } metrics, ${logResult.changes} logs`
    );
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
};

// 📊 Get recent metrics for real-time display
const getRecentMetrics = (limit = 50) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM metrics 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit).reverse(); // Reverse to show oldest first for charts
  } catch (error) {
    console.error('❌ Error fetching recent metrics:', error.message);
    return [];
  }
};

const getRecentAiPolicies = (limit = 10) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM ai_policies 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  } catch (error) {
    console.error('❌ Error fetching recent AI policies:', error.message);
    return [];
  }
};

// 👤 User Authentication Functions
const saveUser = (name, email, hashedPassword, role = 'user') => {
  try {
    return insertUser.run(name, email, hashedPassword, role);
  } catch (error) {
    console.error('❌ Error saving user to SQLite:', error.message);
    return null;
  }
};

const findUserByEmail = email => {
  try {
    const stmt = db.prepare(`SELECT * FROM "dashboard-user" WHERE email = ?`);
    return stmt.get(email);
  } catch (error) {
    console.error('❌ Error finding user by email:', error.message);
    return null;
  }
};

const findUserById = id => {
  try {
    const stmt = db.prepare(
      `SELECT id, name, email, role, is_active, created_at FROM "dashboard-user" WHERE id = ?`
    );
    return stmt.get(id);
  } catch (error) {
    console.error('❌ Error finding user by id:', error.message);
    return null;
  }
};

const updateUserLastLoginFunc = userId => {
  try {
    return updateUserLastLogin.run(userId);
  } catch (error) {
    console.error('❌ Error updating user last login:', error.message);
  }
};

const getAllUsers = () => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, email, role, is_active, last_login, created_at 
      FROM "dashboard-user" 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  } catch (error) {
    console.error('❌ Error fetching all users:', error.message);
    return [];
  }
};

module.exports = {
  saveRequest,
  saveMetric,
  saveBatchMetrics,
  saveLog,
  saveAiPolicy,
  getRecentRequests,
  getRequestsByTimeRange,
  getMetricsByTimeRange,
  getSystemLogs,
  getRecentMetrics,
  getRecentAiPolicies,
  getStats,
  getServerDistribution,
  cleanupOldData,
  // Auth functions at root level for direct access
  saveUser,
  findUserByEmail,
  findUserById,
  updateUserLastLogin: updateUserLastLoginFunc,
  getAllUsers,
  // Nested auth object for organized access
  auth: {
    saveUser,
    findUserByEmail,
    findUserById,
    updateUserLastLogin: updateUserLastLoginFunc,
    getAllUsers
  }
};
