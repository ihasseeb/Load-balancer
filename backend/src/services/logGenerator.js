// Random Log Generator Service
// Generates random API logs every 5 seconds for testing/demo purposes

const { saveLog } = require('../config/sqlite');

class LogGenerator {
  constructor(intervalSeconds = 5) {
    this.intervalSeconds = intervalSeconds;
    this.intervalId = null;
    this.isRunning = false;
  }

  // Random log levels
  getRandomLogLevel() {
    const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG', 'SUCCESS'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  // Random API endpoints
  getRandomEndpoint() {
    const endpoints = [
      '/api/v1/tours',
      '/api/v1/users',
      '/api/v1/auth/login',
      '/api/v1/auth/signup',
      '/api/v1/metrics',
      '/api/v1/logs',
      '/api/v1/health',
      '/api/v1/ai-services',
      '/api/v1/load-balance',
      '/api/v1/servers'
    ];
    return endpoints[Math.floor(Math.random() * endpoints.length)];
  }

  // Random HTTP methods
  getRandomMethod() {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  // Random status codes
  getRandomStatus() {
    const statuses = [200, 201, 204, 301, 400, 401, 403, 404, 500, 502, 503];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // Random IP addresses
  getRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(
      Math.random() * 256
    )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  // Random response time (ms)
  getRandomResponseTime() {
    return Math.floor(Math.random() * 2000) + 50; // 50-2050ms
  }

  // Generate random log message
  generateLogMessage() {
    const messages = [
      'Request processed successfully',
      'Database query executed',
      'Cache hit for endpoint',
      'Request validated',
      'Authentication successful',
      'Rate limit applied',
      'Connection established',
      'Data synchronized',
      'Backup completed',
      'Configuration reloaded',
      'Service health check passed',
      'Load balancer routing request',
      'AI decision model executed',
      'Metrics collected and stored',
      'User session created'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Generate a single random log
  generateLog() {
    const method = this.getRandomMethod();
    const endpoint = this.getRandomEndpoint();
    const status = this.getRandomStatus();
    const ip = this.getRandomIP();
    const responseTime = this.getRandomResponseTime();
    const level = this.getRandomLogLevel();
    const message = this.generateLogMessage();

    const logData = {
      level,
      message: `${method} ${endpoint} - ${message} (${responseTime}ms)`,
      metadata: {
        method,
        endpoint,
        status,
        ip,
        responseTime,
        timestamp: new Date().toISOString(),
        userAgent: 'Random-Log-Generator/1.0'
      }
    };

    return logData;
  }

  // Generate and save a log
  generateAndSaveLog() {
    try {
      const logData = this.generateLog();

      saveLog(
        logData.level,
        logData.message,
        logData.metadata,
        new Date().toISOString()
      );

      console.log(`[LogGen] 📝 ${logData.level} | ${logData.message}`);
    } catch (error) {
      console.error('[LogGen] Error generating log:', error.message);
    }
  }

  // Start automatic log generation
  start() {
    if (this.isRunning) {
      console.log('[LogGen] Log generator already running');
      return;
    }

    this.isRunning = true;
    console.log(
      `[LogGen] ✅ Starting random log generation (every ${
        this.intervalSeconds
      }s, offset +1.5s to avoid DB locks)`
    );

    // Start at +1.5s offset to stagger writes and avoid database locks
    setTimeout(() => {
      this.generateAndSaveLog();
      this.intervalId = setInterval(() => {
        this.generateAndSaveLog();
      }, this.intervalSeconds * 1000);
    }, 1500);
  }

  // Stop log generation
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('[LogGen] ⏹️ Log generator stopped');
    }
  }
}

// Export singleton instance
const logGenerator = new LogGenerator(5); // 5 seconds interval

module.exports = logGenerator;
