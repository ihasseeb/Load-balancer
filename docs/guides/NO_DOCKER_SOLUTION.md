# Complete Solution: Scaling + ML WITHOUT Docker

---

## Problem

You want scaling, rate limiting, auto-scaling WITHOUT Docker or Kubernetes.

## Solution: Stay Local, Add Features Progressively

---

## PHASE 1: Add ML Models (Without Docker)

### Architecture:

```
Backend (Node.js Port 8000)
    ├─ Main Express server
    └─ Spawns Python ML process on demand
         │
         └─ Python ML Service (Port 5000)
            ├─ Loads TensorFlow models
            ├─ Runs inference
            └─ Returns predictions
```

### Step 1: Create Python ML Service

**File: `./ml-models/app.py`**

Use FastAPI to create a Python microservice that:

- Loads pre-trained ML models from joblib
- Exposes `/health` endpoint for status checks
- Provides `/predict` endpoint for single predictions with confidence scores
- Provides `/batch-predict` endpoint for bulk predictions
- Returns predictions with model metadata (production vs mock)
- Handles errors gracefully with 500 responses

### Step 2: Start ML Service from PowerShell

**File: `./start-ml-service.ps1`**

Create a PowerShell script that:

- Verifies Python 3.9+ is installed
- Installs required pip packages (FastAPI, uvicorn, numpy, joblib, scikit-learn, TensorFlow)
- Launches the ML service as a background process on Port 5000
- Waits 3 seconds for service startup
- Tests the `/health` endpoint to confirm successful launch

### Step 3: Integrate ML into Backend

**File: `./app.js` (Backend)**

Add two new Express routes to your Backend application:

**POST `/api/v1/predict`**:

- Accepts a request with feature data
- Makes HTTP POST to ML Service at `http://localhost:5000/predict`
- Receives prediction and confidence score
- Logs metrics to Prometheus (inference time, confidence level)
- Returns JSON response with prediction data

**POST `/api/v1/batch-predict`**:

- Accepts an array of feature datasets
- Makes HTTP POST to ML Service at `http://localhost:5000/batch-predict`
- Returns array of predictions
- Useful for bulk processing operations

### Step 4: Update Main PowerShell Script

**File: `./start-all-services.ps1` (Updated)**

Add ML Service startup to your main orchestration script:

- After NGINX starts, check if Python is available
- If Python exists, launch the ML service as a background process
- Output status message showing ML service running on Port 5000
- If Python is not installed, skip ML service with warning message (non-blocking)

---

## PHASE 2: Rate Limiting (Local Setup)

### Strategy 1: Application-Level Rate Limiting

**File: `./middleware/rateLimiter.js`**

Create middleware using express-rate-limit package with Redis backing:

**API Limiter**: 100 requests per minute per IP address

- Prefix in Redis: `rl:api:`
- Applies to all `/api/` routes

**Auth Limiter**: 5 login attempts per 15 minutes

- Prefix in Redis: `rl:auth:`
- Applies to authentication endpoints
- Only counts failed requests (skipSuccessfulRequests: true)

**ML Limiter**: 50 predictions per minute

- Prefix in Redis: `rl:ml:`
- Applies to prediction endpoints (expensive operations)

Each limiter connects to the local Redis instance (Port 6379) for distributed rate tracking.

**Apply Limiters in app.js**:

- Use `apiLimiter` middleware on all `/api/` routes
- Use `authLimiter` middleware on `/auth/login` route
- Use `mlLimiter` middleware on prediction endpoints

### Strategy 2: User-Based Rate Limiting

Implement user-aware rate limiting where:

- Authenticated users are identified by their user ID
- Unauthenticated requests fall back to IP-based identification
- Premium tier users bypass rate limiting entirely
- Tracks limits per unique user rather than global IP
- Window: 1 minute, Limit: 100 requests per user

### Strategy 3: Caching to Reduce Load

Implement in-memory caching using node-cache:

- Set default TTL (time-to-live) to 60 seconds
- For GET requests (e.g., `/api/v1/tours/:id`):
  - Check if data exists in cache using route-specific key
  - If cached, return immediately without database query
  - If not cached, fetch from database
  - Store result in cache for future requests
- Reduces database queries for frequently accessed data
- Decreases response time and backend load
- Useful for tour details, user profiles, and static configuration

---

## PHASE 3: Manual Scaling (Without Auto-Scaling)

### Create Multiple Backend Instances

**File: `./start-multiple-backends.ps1`**

Create a PowerShell script that:

- Defines an array with 3 Backend instances:
  - Backend-1: Port 8000
  - Backend-2: Port 8001
  - Backend-3: Port 8002
- For each instance:
  - Set the PORT environment variable
  - Launch a new PowerShell process in minimized window
  - Run `npm start` with the designated port
  - Wait 1 second between launches
  - Output status message for each instance
- Display final message showing all ports are running

### Update NGINX to Load Balance

**File: `./bin/nginx.conf` (Updated)**

Create an upstream block with the following configuration:

**Upstream Definition**:

- Name: `backend`
- Load balancing algorithm: `least_conn` (sends requests to server with least connections)
- Servers:
  - 127.0.0.1:8000
  - 127.0.0.1:8001
  - 127.0.0.1:8002

**Server Configuration**:

- Listen on port 80
- For `/api` location:
  - Proxy to upstream backend group
  - Set proxy headers (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)
  - Configure timeout settings (60 seconds for all timeout types)
- For `/metrics` location:
  - Proxy to upstream backend group
- For `/` root location:
  - Proxy to Dashboard at 127.0.0.1:3000

---

## PHASE 4: Monitoring & Health Checks (Local)

### Health Check Script

**File: `./start-services-monitor.ps1` (Enhanced)**

Enhance the monitoring script to track scaled services:

**Service Checks** (8 total):

- Redis (Port 6379)
- Prometheus (Port 9090)
- Loki (Port 3100)
- Backend-1 (Port 8000)
- Backend-2 (Port 8001)
- Backend-3 (Port 8002)
- ML Service (Port 5000)
- Dashboard (Port 3000)

**Monitoring Logic**:

- For each service, use Get-NetTCPConnection to check port availability
- Display [OK] in green for running services
- Display [X] in red for unavailable services
- Count and display summary (X/8 services running)

**Backend Health Testing**:

- Make HTTP request to `http://localhost:8000/health` endpoint
- If successful (Status 200), confirm Backend API is responding
- If fails, alert that Backend API is not responding

**Quick Access Display**:

- Display URLs for all services with formatted output
- Helps users quickly access monitoring interfaces

---

## PHASE 5: Load Testing (Simulate High Traffic)

**File: `./load-test.ps1`**

Create a PowerShell load testing script that:

- Verifies Apache Bench is installed at `C:\Program Files\Apache Software Foundation\Apache2.4\bin\ab.exe`
- If not installed, displays installation instructions
- Configures test parameters:
  - Target URL: `http://localhost/api/v1/tours` (through NGINX load balancer)
  - Total Requests: 1000
  - Concurrent Requests: 10
- Executes Apache Bench with specified parameters
- Displays performance metrics (requests/sec, response times, throughput)
- Recommends checking Prometheus dashboard at `http://localhost:9090` for detailed metrics

**Optional**: Install via Chocolatey with `choco install apache-httpd` if available

---

## COMPLETE WORKFLOW (WITHOUT DOCKER)

### Step 1: Setup Initial Services

Run the setup script to download all service binaries.

### Step 2: Start All Services

Execute scripts in sequence:

1. Start all 7 core services (Redis, Prometheus, Loki, Promtail, NGINX, Backend, Dashboard)
2. Start the Python ML service on Port 5000
3. Start multiple Backend instances (3 instances on ports 8000, 8001, 8002)

### Step 3: Monitor Everything

Run the monitoring script to verify all services are running and display quick access URLs.

### Step 4: Test with Load

Execute the load testing script to simulate realistic traffic patterns and observe performance metrics in Prometheus.

---

## Architecture Without Docker

```
SINGLE MACHINE (Windows)
│
├─ External Services (Background)
│   ├─ Redis (6379) - Cache
│   ├─ Prometheus (9090) - Metrics
│   ├─ Loki (3100) - Logs
│   ├─ Promtail - Log Shipper
│   └─ NGINX (80) - Load Balancer
│
├─ Application Layer (Multiple Instances)
│   ├─ Backend-1 (8000) \
│   ├─ Backend-2 (8001) ├─ LOAD BALANCED by NGINX
│   └─ Backend-3 (8002) /
│
├─ ML Service (Python)
│   └─ Port 5000
│
└─ Dashboard (React)
    └─ Port 3000
```

---

## Traffic Flow

```
User → NGINX (80)
         ├─ Round-robin to Backend-1 (8000)
         ├─ Round-robin to Backend-2 (8001)
         └─ Round-robin to Backend-3 (8002)

Backend → ML Service (5000) for predictions

All Metrics → Prometheus (9090) → Dashboard
All Logs → Loki (3100) → Dashboard
```

---

## Rate Limiting Applied

```
API Calls:     100 req/min per IP
Auth Login:    5 attempts / 15 min
ML Predict:    50 predictions/min per user
Premium Users: No rate limit
```

---

## Scaling Strategy (Manual)

```
LOW TRAFFIC (1000 req/min):
├─ Run 1 Backend instance
├─ ML Service optional
└─ Light monitoring

MEDIUM TRAFFIC (5000 req/min):
├─ Run 2 Backend instances
├─ ML Service active
└─ Regular monitoring

HIGH TRAFFIC (10000+ req/min):
├─ Run 3+ Backend instances
├─ ML Service on dedicated port
├─ Caching enabled
└─ Rate limiting active
```

---

## Comparison: Docker vs Non-Docker Setup

| Feature                 | Docker         | Non-Docker (Current)        |
| ----------------------- | -------------- | --------------------------- |
| Deployment              | Single command | Multiple PS1 scripts        |
| Portability             | 100%           | Windows only                |
| Scaling                 | K8s (complex)  | Multiple processes (simple) |
| Resource Usage          | Lighter        | Heavier                     |
| Learning Curve          | Steep          | Gradual                     |
| Production Ready        | Yes            | For Windows only            |
| Auto-Scaling            | Yes (K8s)      | Manual                      |
| Environment Consistency | Perfect        | Windows dependent           |

---

## When to Migrate to Docker

✓ When deployed on multiple machines
✓ When using Linux servers
✓ When need true auto-scaling
✓ When deploying to cloud
✓ When team uses different OS

✗ For local development (current setup is fine)
✗ For simple Windows-only deployments
✗ When learning basic concepts

---

## Summary: NO DOCKER SOLUTION

### What You Do:

1. ✓ Keep PowerShell scripts for service setup
2. ✓ Add Python ML service locally
3. ✓ Implement rate limiting in Backend
4. ✓ Run multiple Backend instances
5. ✓ Use NGINX for load balancing
6. ✓ Monitor with existing tools
7. ✓ Manual scaling as needed

### What You Get:

- ✓ ML integration working
- ✓ Rate limiting active
- ✓ Horizontal scaling (3 Backend instances)
- ✓ Load balancing via NGINX
- ✓ Real-time monitoring
- ✓ No Docker complexity
- ✓ Ready for production (on Windows)

### When Ready for Kubernetes:

Just containerize this setup with Dockerfiles, then deploy to K8s!

---

**Files to Create/Update:**

1. `./ml-models/app.py` - ML Service
2. `./start-ml-service.ps1` - Start ML
3. `./start-multiple-backends.ps1` - Multiple instances
4. `./middleware/rateLimiter.js` - Rate limiting
5. `./bin/nginx.conf` - Load balancing config
6. `./load-test.ps1` - Load testing
7. Update `./app.js` - ML integration
8. Update `./start-all-services.ps1` - Include ML service

**Done! No Docker needed!** 🎉
