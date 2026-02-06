# 📊 SQLite Database Integration

## Overview
This project now uses **SQLite** for persistent storage of logs, metrics, and API requests. All data is automatically saved to the database and can be accessed through the dashboard.

## 🗄️ Database Location
- **Path**: `logs/monitoring.db`
- **Type**: SQLite3 (better-sqlite3)
- **Mode**: WAL (Write-Ahead Logging) for better concurrent access

## 📋 Database Schema

### 1. **api_requests** Table
Stores all incoming API requests with full details:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| timestamp | TEXT | ISO 8601 timestamp |
| ip | TEXT | Client IP address |
| method | TEXT | HTTP method (GET, POST, etc.) |
| endpoint | TEXT | Request endpoint/URL |
| status | INTEGER | HTTP status code |
| device | TEXT | Device type (Windows, Android, iOS, etc.) |
| source | TEXT | Traffic source (Direct, referrer domain) |
| bytes | INTEGER | Response size in bytes |
| ai_decision | TEXT | AI decision (Allowed, Blocked, Redirected) |
| response_time | INTEGER | Response time in milliseconds |
| user_agent | TEXT | Full user agent string |
| created_at | DATETIME | Database insertion time |

### 2. **metrics** Table
Stores aggregated metrics:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| metric_name | TEXT | Name of the metric |
| metric_value | REAL | Metric value |
| timestamp | TEXT | ISO 8601 timestamp |
| created_at | DATETIME | Database insertion time |

### 3. **system_logs** Table
Stores system events and errors:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| level | TEXT | Log level (info, warn, error) |
| message | TEXT | Log message |
| metadata | TEXT | JSON metadata |
| timestamp | TEXT | ISO 8601 timestamp |
| created_at | DATETIME | Database insertion time |

## 🚀 How It Works

### Automatic Data Collection
Every API request is automatically logged to SQLite through middleware in `app.js`:

```javascript
// Middleware captures all requests
app.use((req, res, next) => {
  res.on('finish', () => {
    const logData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      endpoint: req.originalUrl,
      status: res.statusCode,
      device: detectDevice(req),
      source: extractSource(req),
      bytes: res.get('Content-Length'),
      ai_decision: determineAIDecision(res.statusCode),
      response_time: Date.now() - startTime,
      user_agent: req.get('User-Agent')
    };
    
    saveRequest(logData); // Saves to SQLite
  });
  next();
});
```

### Dashboard Integration
The dashboard fetches data every 3 seconds from the SQLite database:

**Frontend** (`LogsPage.tsx`):
```typescript
useEffect(() => {
  fetchLogs();
  const interval = setInterval(fetchLogs, 3000); // Poll every 3 seconds
  return () => clearInterval(interval);
}, []);
```

**Backend** (`routes/logsRoutes.js`):
```javascript
router.get('/', async (req, res) => {
  const requests = getRecentRequests(100); // Fetch from SQLite
  res.json({ status: 'success', data: requests });
});
```

## 📊 Dashboard Columns
All these columns are stored in SQLite and displayed in the dashboard:

1. **Timestamp** - Request time
2. **IP Address** - Client IP
3. **Method** - HTTP method
4. **Endpoint** - Request URL
5. **Status** - HTTP status code
6. **Device** - Device type
7. **Source** - Traffic source
8. **Bytes** - Response size
9. **AI Decision** - AI routing decision

## 🔧 Setup & Usage

### 1. Install Dependencies
```bash
npm install better-sqlite3 --save
```

### 2. Initialize Database
Run the setup script:
```powershell
.\setup-tools.ps1
```

This will:
- Download all required services
- Create `logs/monitoring.db`
- Initialize database tables
- Create indexes for performance

### 3. Start Services
```powershell
.\start-all-services.ps1
```

The database will automatically:
- Capture all API requests
- Store data with all required columns
- Make data available to the dashboard

### 4. View Data
Open the dashboard at `http://localhost:3000` and navigate to "Logs & Metrics" page.

## 🔍 Querying the Database

### Using Node.js
```javascript
const { getRecentRequests, getRequestStats } = require('./config/sqlite');

// Get last 100 requests
const logs = getRecentRequests(100);

// Get statistics
const stats = getRequestStats();
console.log(stats);
// {
//   total_requests: 1234,
//   unique_visitors: 56,
//   total_bytes: 1234567,
//   avg_response_time: 123.45,
//   error_count: 12,
//   success_count: 1222
// }
```

### Using SQLite CLI
```bash
sqlite3 logs/monitoring.db

# View recent requests
SELECT * FROM api_requests ORDER BY created_at DESC LIMIT 10;

# Get error rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as errors,
  (SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate
FROM api_requests;

# Get top endpoints
SELECT endpoint, COUNT(*) as hits 
FROM api_requests 
GROUP BY endpoint 
ORDER BY hits DESC 
LIMIT 10;
```

## 🧹 Maintenance

### Cleanup Old Data
To prevent database from growing too large, you can clean up old data:

```javascript
const { cleanupOldData } = require('./config/sqlite');

// Remove data older than 7 days
cleanupOldData(7);
```

### Database Size
Monitor database size:
```powershell
Get-Item "logs/monitoring.db" | Select-Object Name, Length
```

### Backup
```powershell
# Create backup
Copy-Item "logs/monitoring.db" "logs/monitoring.db.backup"
```

## 🎯 Performance

### Optimizations
- **WAL Mode**: Enabled for better concurrent read/write
- **Prepared Statements**: Used for all queries
- **Indexes**: Created on frequently queried columns
- **Batch Inserts**: Can be implemented for high-traffic scenarios

### Expected Performance
- **Writes**: ~10,000 inserts/second
- **Reads**: ~100,000 queries/second
- **Storage**: ~1KB per request (approximate)

## 🔐 Security

### Best Practices
1. Database file is in `logs/` directory (not publicly accessible)
2. No SQL injection possible (prepared statements)
3. Input validation on all fields
4. Regular backups recommended

## 🐛 Troubleshooting

### Database Locked Error
If you see "database is locked" errors:
```javascript
// Increase timeout
db.pragma('busy_timeout = 5000');
```

### Database Corruption
```bash
# Check integrity
sqlite3 logs/monitoring.db "PRAGMA integrity_check;"

# Rebuild if needed
sqlite3 logs/monitoring.db "VACUUM;"
```

### Missing Data
Check if middleware is running:
```javascript
// In app.js, uncomment this line to see logs
console.log('✅ Request saved to SQLite:', logData);
```

## 📈 Future Enhancements

Potential improvements:
- [ ] Add data aggregation tables for faster analytics
- [ ] Implement automatic cleanup scheduler
- [ ] Add export to CSV/JSON functionality
- [ ] Create backup automation
- [ ] Add database viewer in dashboard
- [ ] Implement real-time WebSocket updates

## 📚 References

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [WAL Mode](https://www.sqlite.org/wal.html)

---

**Created**: 2026-01-24  
**Last Updated**: 2026-01-24  
**Version**: 1.0.0
