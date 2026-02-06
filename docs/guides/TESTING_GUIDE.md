# 🚀 Complete Testing Guide - SQLite Real-Time Dashboard

## ✅ **Step 1: Start All Services**

```powershell
.\start-all-services.ps1
```

**Expected Output:**
```
[SUCCESS] All Services Online!
Backend API:    http://localhost:8000
Dashboard:      http://localhost:3000
```

---

## 🌐 **Step 2: Open Dashboard**

Browser mein open karein:
```
http://localhost:3000
```

Ya script automatically open kar dega.

---

## 🔐 **Step 3: Login (if required)**

Default credentials:
- Username: `admin`
- Password: `admin`

---

## 📊 **Step 4: Start Monitoring**

Dashboard mein:
1. **"Start Monitoring"** button click karein (top right)
2. **"Logs & Metrics"** page pe jayein (sidebar se)

---

## 🧪 **Step 5: Test API Requests**

Naye PowerShell terminal mein ye commands run karein:

### **Working Endpoints (No Authentication Required)**

```powershell
# 1. Health Check
curl http://localhost:8000/api/v1/health

# 2. Logs Endpoint (SQLite data)
curl http://localhost:8000/api/v1/logs

# 3. Logs Statistics
curl http://localhost:8000/api/v1/logs/stats

# 4. Metrics
curl http://localhost:8000/api/v1/metrics

# 5. Detailed Metrics
curl http://localhost:8000/api/v1/metrics/detailed

# 6. Services Status
curl http://localhost:8000/api/v1/services/status

# 7. Server Status
curl http://localhost:8000/api/v1/servers/status
```

### **Multiple Requests (Generate Traffic)**

```powershell
# Generate 10 health check requests
for ($i=1; $i -le 10; $i++) {
    curl http://localhost:8000/api/v1/health -UseBasicParsing
    Write-Host "Request $i sent"
    Start-Sleep -Milliseconds 500
}
```

---

## 📈 **Step 6: View Real-Time Data in Dashboard**

Dashboard **"Logs & Metrics"** page mein aapko dikhega:

### **Expected Data:**

| Timestamp | IP Address | Method | Endpoint | Status | Device | Source | Bytes | AI Decision |
|-----------|------------|--------|----------|--------|--------|--------|-------|-------------|
| 21:03:45 | ::1 | GET | /api/v1/health | 200 | Windows | Direct | 221 | Allowed |
| 21:03:44 | ::1 | GET | /api/v1/logs | 200 | Windows | Direct | 475 | Allowed |
| 21:03:43 | ::1 | GET | /api/v1/metrics | 200 | Windows | Direct | 1024 | Allowed |

### **Auto-Refresh:**
- Dashboard har **3 seconds** mein automatically refresh hoga
- Naye requests automatically table mein add honge

---

## 🔍 **Step 7: Verify SQLite Database**

```powershell
# Check database file exists
Test-Path "logs\monitoring.db"

# Run test script
node test-sqlite.js

# View database size
Get-Item "logs\monitoring.db" | Select-Object Name, Length
```

---

## 📊 **Step 8: Check Statistics**

Dashboard mein ye metrics dikhne chahiye:

- **Total Requests**: Increasing count
- **Error Rate**: 0% (if all requests successful)
- **Data Volume**: Total bytes transferred
- **Unique Visitors**: Number of unique IPs

---

## 🛠️ **Step 9: Monitor Services**

```powershell
.\start-services-monitor.ps1
```

**Expected Output:**
```
[OK] Redis (Port 6379) - Running
[OK] Backend API (8000) - Responding
[OK] Dashboard (3000) - Responding
```

---

## 🛑 **Step 10: Stop All Services**

Jab testing complete ho:

```powershell
.\stop-all-services.ps1
```

---

## ✅ **Success Checklist**

Dashboard mein ye sab hona chahiye:

- [ ] Backend running on port 8000
- [ ] Dashboard running on port 3000
- [ ] "Start Monitoring" button clicked
- [ ] Logs & Metrics page open
- [ ] Real data visible (not fake/random)
- [ ] Data updates every 3 seconds
- [ ] All 9 columns visible in table
- [ ] New requests appear automatically
- [ ] Statistics update correctly
- [ ] No errors in browser console

---

## 🎯 **Expected Results**

### **Before (Fake Data):**
- ❌ Random IPs (123.45.67.89)
- ❌ Random endpoints
- ❌ Data changes every 2 seconds
- ❌ No persistence

### **After (Real Data):**
- ✅ Real IPs (::1, 127.0.0.1)
- ✅ Real endpoints (/api/v1/health, /api/v1/logs)
- ✅ Data updates every 3 seconds
- ✅ Persistent in SQLite
- ✅ Survives server restart

---

## 🐛 **Troubleshooting**

### **Issue: No data in dashboard**

**Solution:**
1. Check backend is running: `curl http://localhost:8000/api/v1/health`
2. Click "Start Monitoring" button
3. Make some API requests (Step 5)
4. Wait 3 seconds for refresh

### **Issue: Authentication errors**

**Solution:**
- Use only the endpoints listed in Step 5
- Avoid `/api/v1/tours` and `/api/v1/users` (require auth)

### **Issue: MongoDB errors in console**

**Solution:**
- This is normal! Server works with SQLite only
- MongoDB is optional now
- Ignore MongoDB connection errors

---

## 📝 **Quick Test Commands**

Copy-paste this entire block:

```powershell
# Quick test - 5 requests
Write-Host "Sending test requests..." -ForegroundColor Yellow

curl http://localhost:8000/api/v1/health -UseBasicParsing | Out-Null
Write-Host "✓ Health check" -ForegroundColor Green

curl http://localhost:8000/api/v1/logs -UseBasicParsing | Out-Null
Write-Host "✓ Logs fetched" -ForegroundColor Green

curl http://localhost:8000/api/v1/metrics -UseBasicParsing | Out-Null
Write-Host "✓ Metrics fetched" -ForegroundColor Green

curl http://localhost:8000/api/v1/services/status -UseBasicParsing | Out-Null
Write-Host "✓ Services status" -ForegroundColor Green

curl http://localhost:8000/api/v1/logs/stats -UseBasicParsing | Out-Null
Write-Host "✓ Statistics fetched" -ForegroundColor Green

Write-Host "`n✅ All requests sent! Check dashboard now." -ForegroundColor Cyan
Write-Host "Dashboard should show 5+ new entries" -ForegroundColor Cyan
```

---

## 🎉 **Final Verification**

1. Open dashboard: `http://localhost:3000`
2. Go to "Logs & Metrics" page
3. Click "Start Monitoring"
4. Run quick test commands above
5. Watch data appear in real-time!

---

**Created**: 2026-01-24  
**Status**: ✅ Ready to Test  
**Version**: 1.0.0

**Ab Dashboard Real Data Show Karega! 🚀**
