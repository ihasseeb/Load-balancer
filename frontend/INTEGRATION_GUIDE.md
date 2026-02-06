# 🚀 Real-Time Services Monitoring - Complete Setup Guide

## 📋 Overview

Yeh guide aapko batayega ke kaise aap apne Docker Compose services ko **bina Docker ke** run karein aur Dashboard mein **real-time** monitoring dekhen.

---

## ✅ What's Been Implemented

### Backend (API):
1. ✅ **Services Status Endpoint** - `/api/v1/services/status`
   - Sabhi services ki real-time status check karta hai
   - Port availability check
   - Response time measurement
   - Service health monitoring

2. ✅ **Individual Service Endpoint** - `/api/v1/services/:serviceId`
   - Specific service ki detailed status

3. ✅ **Service Types Tracked:**
   - 🚀 Natours App (Port 8000)
   - 📊 Prometheus (Port 9090)
   - 📝 Loki (Port 3100)
   - 📈 Grafana (Port 3030)
   - ⚡ Redis (Port 6379)
   - 🌐 NGINX (Port 80)
   - 🔌 Backend API (Port 3000)

### Dashboard (Frontend):
1. ✅ **API Service** - `src/services/api.ts`
   - Backend se communicate karta hai
   - TypeScript interfaces
   - Error handling

2. ✅ **Services Monitor Component** - `src/components/ServicesMonitor.tsx`
   - Real-time status display
   - Auto-refresh har 3 seconds
   - Beautiful UI with animations
   - Service cards with details
   - Quick actions (Open, Refresh)

3. ✅ **Premium Styling** - `src/components/ServicesMonitor.css`
   - Glassmorphism effects
   - Smooth animations
   - Color-coded status
   - Responsive design

4. ✅ **Navigation**
   - Sidebar mein "Services Monitor" link added
   - Route configured

---

## 🚀 How to Run Services (Without Docker)

### 1️⃣ Backend API (Already Running)
```bash
cd "e:\Courses + Projects\Practices\Node Js\3-natour-project\Load Balancer"
npm start
```
**Port:** 3000 ✅

---

### 2️⃣ Prometheus (Metrics Collection)

#### Download:
```bash
# Download from: https://prometheus.io/download/
# Extract to a folder
```

#### Run:
```bash
cd path\to\prometheus
prometheus --config.file="e:\Courses + Projects\Practices\Node Js\3-natour-project\Load Balancer\prometheus-config.yml"
```
**Port:** 9090
**Access:** http://localhost:9090

---

### 3️⃣ Loki (Log Aggregation)

#### Download:
```bash
# Download from: https://github.com/grafana/loki/releases
# Get loki-windows-amd64.exe
```

#### Run:
```bash
cd path\to\loki
loki-windows-amd64.exe --config.file="e:\Courses + Projects\Practices\Node Js\3-natour-project\Load Balancer\loki-config.yml"
```
**Port:** 3100
**Access:** http://localhost:3100

---

### 4️⃣ Grafana (Visualization)

#### Download:
```bash
# Download from: https://grafana.com/grafana/download?platform=windows
# Install or extract
```

#### Run:
```bash
cd path\to\grafana\bin
grafana-server.exe
```
**Port:** 3030 (configure in grafana.ini)
**Access:** http://localhost:3030
**Default Login:** admin/admin

---

### 5️⃣ Redis (Cache)

#### Download:
```bash
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use: https://redis.io/download
```

#### Run:
```bash
cd path\to\redis
redis-server.exe
```
**Port:** 6379
**Check:** `redis-cli ping` (should return PONG)

---

### 6️⃣ NGINX (Reverse Proxy)

#### Download:
```bash
# Download from: http://nginx.org/en/download.html
# Extract to a folder
```

#### Configure:
Copy your `nginx.conf` to nginx folder

#### Run:
```bash
cd path\to\nginx
nginx.exe
```
**Port:** 80
**Access:** http://localhost

**Stop:**
```bash
nginx.exe -s stop
```

---

## 🎨 Dashboard Setup

### 1️⃣ Create .env File (Optional)
```bash
# AI Load Balancing Dashboard/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 2️⃣ Start Dashboard
```bash
cd "AI Load Balancing Dashboard"
npm install  # If not already done
npm run dev
```

### 3️⃣ Access Dashboard
```
http://localhost:5173
```

### 4️⃣ Navigate to Services Monitor
- Login to dashboard
- Click "Services Monitor" in sidebar
- See real-time status of all services!

---

## 📊 What You'll See in Dashboard

### Summary Cards:
- 📊 **Total Services** - Total number of services
- ✅ **Running** - Services that are active
- ❌ **Stopped** - Services that are not running
- ⏱️ **Timeout** - Services that didn't respond

### Service Cards (for each service):
- **Icon & Name** - Service identifier
- **Type Badge** - Service category
- **Status Badge** - Running/Stopped/Timeout
- **Description** - What the service does
- **Endpoint** - Host:Port
- **Response Time** - How fast it responded
- **Uptime** - Service availability
- **Last Checked** - When it was last checked
- **Actions:**
  - 🔗 **Open** - Opens service in new tab
  - 🔄 **Refresh** - Refreshes status

### Auto-Refresh:
- 🔄 Updates every 3 seconds automatically
- Real-time monitoring
- No manual refresh needed

---

## 🎯 Quick Start (Minimal Setup)

Agar aap sirf testing karna chahte hain:

### Start These 3 Services:
1. **Backend API** (Port 3000) - Already running
2. **Redis** (Port 6379) - Easy to install
3. **Dashboard** (Port 5173) - Already have

```bash
# Terminal 1: Backend
cd "e:\Courses + Projects\Practices\Node Js\3-natour-project\Load Balancer"
npm start

# Terminal 2: Redis
cd path\to\redis
redis-server.exe

# Terminal 3: Dashboard
cd "AI Load Balancing Dashboard"
npm run dev
```

Dashboard mein aap dekhenge:
- ✅ Backend API - Running
- ✅ Redis - Running
- ❌ Prometheus - Stopped
- ❌ Loki - Stopped
- ❌ Grafana - Stopped
- ❌ NGINX - Stopped

---

## 🔍 Testing Endpoints

### Test Backend Endpoints:
```bash
# Services status
curl http://localhost:3000/api/v1/services/status

# Individual service
curl http://localhost:3000/api/v1/services/redis
```

### Expected Response:
```json
{
  "status": "success",
  "summary": {
    "total": 7,
    "running": 2,
    "stopped": 5,
    "timeout": 0
  },
  "services": [
    {
      "id": "backend-api",
      "name": "Backend API",
      "status": "running",
      "responseTime": 5,
      "port": 3000,
      ...
    },
    ...
  ]
}
```

---

## 🎨 Features

### Real-Time Monitoring:
- ✅ Auto-refresh every 3 seconds
- ✅ Live status updates
- ✅ Response time tracking
- ✅ Port availability check

### Beautiful UI:
- ✅ Glassmorphism design
- ✅ Smooth animations
- ✅ Color-coded status
- ✅ Responsive layout
- ✅ Dark gradient background

### Service Information:
- ✅ Service name & icon
- ✅ Service type (Application, Monitoring, etc.)
- ✅ Current status
- ✅ Endpoint details
- ✅ Response time
- ✅ Uptime percentage
- ✅ Last check timestamp

### Quick Actions:
- ✅ Open service in browser
- ✅ Manual refresh
- ✅ Auto-refresh indicator

---

## 🐛 Troubleshooting

### Issue: All services showing "stopped"
**Solution:**
- Check if services are actually running
- Verify ports are correct
- Check firewall settings

### Issue: Dashboard not connecting to backend
**Solution:**
- Backend running on port 3000?
- CORS enabled in backend? ✅ (Already done)
- Check browser console for errors

### Issue: Service shows "timeout"
**Solution:**
- Service might be slow to respond
- Increase timeout in backend (currently 2 seconds)
- Check if service is actually running

### Issue: Can't open service
**Solution:**
- Service must be "running" status
- Check if port is accessible
- Try opening manually: `http://localhost:PORT`

---

## 📝 Service Installation Links

### Windows Downloads:
1. **Prometheus:** https://prometheus.io/download/
2. **Loki:** https://github.com/grafana/loki/releases
3. **Grafana:** https://grafana.com/grafana/download?platform=windows
4. **Redis:** https://github.com/microsoftarchive/redis/releases
5. **NGINX:** http://nginx.org/en/download.html

### Quick Install (Chocolatey):
```bash
# If you have Chocolatey installed
choco install redis-64
choco install nginx
```

---

## 🎉 Success Checklist

- [ ] Backend API running (Port 3000)
- [ ] Services endpoint working (`/api/v1/services/status`)
- [ ] Dashboard running (Port 5173)
- [ ] Can access Services Monitor page
- [ ] See real-time status updates
- [ ] Services auto-refresh working
- [ ] Can click "Open" on running services

---

## 💡 Pro Tips

1. **Start with minimal services** (Backend + Redis) for testing
2. **Add services gradually** as you need them
3. **Use Task Scheduler** to auto-start services on Windows boot
4. **Create batch files** for easy service startup
5. **Monitor logs** in respective service directories

---

## 📚 Next Steps

1. ✅ Start backend and dashboard
2. ✅ Test Services Monitor page
3. 📦 Install additional services (Prometheus, Grafana, etc.)
4. 🔧 Configure services with your config files
5. 📊 Set up Grafana dashboards
6. 🔔 Add alerting (future enhancement)

---

## 🎯 Summary

Ab aapke paas:
- ✅ Real-time services monitoring
- ✅ Beautiful dashboard UI
- ✅ Auto-refresh functionality
- ✅ Service health tracking
- ✅ Quick actions
- ✅ Complete documentation

**Dashboard mein jao aur Services Monitor dekho! 🚀**

---

**Questions? Issues? Mujhe batayein! 😊**
