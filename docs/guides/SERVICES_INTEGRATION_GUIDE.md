# Services Integration Guide - Real-Time Dashboard

## Architecture & Strategy for Real-Time Data Flow

---

## 1. System Overview

### Services Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                    7-SERVICE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MONITORING LAYER:                                          │
│  ├── Prometheus (Port 9090) - Metrics Collection           │
│  ├── Loki (Port 3100) - Log Aggregation                    │
│  └── Promtail - Log Shipping                               │
│                                                             │
│  CACHING & STORAGE LAYER:                                   │
│  ├── Redis (Port 6379) - Session & Cache Store            │
│  └── NGINX (Port 80) - Reverse Proxy                       │
│                                                             │
│  APPLICATION LAYER:                                         │
│  ├── Backend API (Port 8000) - Express Server             │
│  └── Dashboard (Port 3000) - React/Vite Frontend          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Architecture

### 2.1 Backend Metrics Collection

**WHERE:** Backend API Server (Port 8000)
**WHAT:** Collects application-level metrics
**HOW:** Exposes metrics endpoint for Prometheus scraping

```
Backend Application
  ↓
  Tracks: API response times, requests/sec, errors, active users
  ↓
  Exposes: /metrics endpoint (Prometheus format)
  ↓
  Prometheus scrapes every 15 seconds
  ↓
  Stores in time-series database
```

### 2.2 Service Health Monitoring

**WHERE:** Backend Health Check Endpoints
**WHAT:** Real-time service status
**HOW:** Dashboard polls backend for service status

```
Services Running (Redis, Prometheus, Loki, NGINX)
  ↓
  Backend checks each service port/endpoint
  ↓
  Compiles status summary
  ↓
  Dashboard fetches /api/v1/services/status
  ↓
  Every 3 seconds auto-refresh
  ↓
  ServicesMonitor component displays real-time status
```

### 2.3 Log Aggregation Pipeline

**WHERE:** Loki + Promtail
**WHAT:** Centralized log storage and querying
**HOW:** Promtail ships logs to Loki, dashboard queries via API

```
Backend Logs (in logs/ folder)
  ↓
  Promtail tails log files
  ↓
  Ships to Loki (Port 3100)
  ↓
  Loki stores & indexes
  ↓
  Dashboard queries via Loki API
  ↓
  Displays logs in real-time
```

---

## 3. Connection Points & Integration Layers

### 3.1 Backend → Prometheus Integration

**Responsibility:** Backend must expose metrics in Prometheus format

**Integration Point:** `/metrics` endpoint on port 8000

- Returns metrics in OpenMetrics format
- Prometheus configuration points to this endpoint
- Scrape interval: 15 seconds (configurable)

**Metrics to Track:**

- HTTP request count (by endpoint, status code)
- Response time distribution (p50, p95, p99)
- Active database connections
- Cache hit/miss rates (Redis)
- Load balancer decisions
- AI model inference time
- Database query duration

### 3.2 Backend → Service Status API Integration

**Responsibility:** Backend must check all service ports

**Integration Point:** `/api/v1/services/status` endpoint on port 8000

- Returns current status of all 7 services
- Checks each service port connectivity
- Returns uptime, last check time, response metrics

**Response Format:**

```
Services checked:
- Redis (6379) - TCP connection test
- Prometheus (9090) - HTTP /api/v1/query endpoint
- Loki (3100) - HTTP /loki/api/v1/status endpoint
- Promtail - Process check / port 9080
- NGINX (80) - HTTP request test
- Backend (8000) - Self status
- Dashboard (3000) - HTTP request test
```

### 3.3 Dashboard → Backend Integration

**Responsibility:** Dashboard fetches and displays real-time data

**Integration Points:**

1. **Service Status:** `GET /api/v1/services/status`

   - Called every 3 seconds
   - Updates ServicesMonitor component

2. **Metrics Data:** `GET /api/v1/metrics`

   - Called every 5 seconds
   - Fetches aggregated metrics
   - Updates charts and graphs

3. **Logs Data:** `GET /api/v1/logs`
   - Called on-demand or every 10 seconds
   - Fetches from Loki via Backend
   - Displays in logs viewer

### 3.4 Dashboard → Prometheus Integration (Optional Direct)

**Responsibility:** Dashboard queries Prometheus directly (if allowed by CORS)

**Integration Point:** `http://localhost:9090/api/v1/query`

- Query metrics directly from Prometheus
- Useful for real-time charting
- May need NGINX reverse proxy to handle CORS

---

## 4. Component Communication Map

### 4.1 Real-Time Status Dashboard

```
ServicesMonitor Component (React)
  ↓
  useEffect hook (3-second interval)
  ↓
  fetch('/api/v1/services/status')
  ↓
  Backend service checker
    ├── Check Redis port 6379 (TCP)
    ├── Check Prometheus /api/v1/status (HTTP)
    ├── Check Loki port 3100 (HTTP)
    ├── Check Promtail port 9080 (TCP)
    ├── Check NGINX port 80 (HTTP)
    └── Check self port 8000
  ↓
  Response with status, uptime, response time
  ↓
  Component renders status cards
```

### 4.2 Metrics Dashboard

```
MetricsChart Component (React)
  ↓
  useEffect hook (5-second interval)
  ↓
  fetch('/api/v1/metrics')
  ↓
  Backend queries Prometheus
    ├── Query: request_count (gauge)
    ├── Query: response_time_ms (histogram)
    ├── Query: active_connections (gauge)
    └── Query: cache_hit_ratio (gauge)
  ↓
  Response with time-series data
  ↓
  Component renders charts (using Chart.js/Recharts)
```

### 4.3 Logs Dashboard

```
LogsViewer Component (React)
  ↓
  User clicks "Fetch Logs" or auto-refresh (10s)
  ↓
  fetch('/api/v1/logs?since=5m')
  ↓
  Backend queries Loki
    ├── Query: {service="backend"} (LogQL)
    ├── Limit: last 100 logs
    └── Range: last 5 minutes
  ↓
  Response with log entries + timestamps
  ↓
  Component renders log table/stream
```

---

## 5. Backend Service Implementation Plan

### 5.1 Required Endpoints

**Endpoint 1: GET /metrics**

- Purpose: Expose application metrics for Prometheus
- Format: Prometheus text format
- Refresh: Real-time (updated on each request)
- Status Code: 200 OK

**Endpoint 2: GET /api/v1/services/status**

- Purpose: Return current status of all 7 services
- Format: JSON with service details
- Refresh: Computed on each request
- Status Code: 200 OK

**Endpoint 3: GET /api/v1/metrics**

- Purpose: Return aggregated metrics for dashboard
- Format: JSON time-series data
- Refresh: Fetched from Prometheus
- Status Code: 200 OK

**Endpoint 4: GET /api/v1/logs**

- Purpose: Return recent logs from Loki
- Format: JSON log entries
- Query Params: `since`, `limit`, `service`
- Refresh: Fetched from Loki
- Status Code: 200 OK

### 5.2 Required Middleware/Utilities

**Service Checker Module:**

- Checks each service port
- Returns: status, response_time, uptime
- Handles timeouts gracefully

**Prometheus Client:**

- Tracks application metrics
- Registers custom metrics
- Exposes /metrics endpoint

**Loki Query Client:**

- Queries logs from Loki
- Parses LogQL responses
- Formats for frontend

**Error Handling:**

- Timeouts on service checks
- Failed connections
- Missing services gracefully

---

## 6. Frontend Integration Strategy

### 6.1 Dashboard Components Architecture

```
Dashboard (Main Container)
├── Header
│   └── Navigation & Status Indicator
├── ServicesMonitor Component
│   ├── Service Grid (7 cards)
│   ├── Quick Actions (Start/Stop/Refresh)
│   └── Status Summary
├── MetricsPanel Component
│   ├── Performance Charts
│   ├── Resource Usage Graphs
│   └── Real-time Statistics
├── LogsViewer Component
│   ├── Log Stream/Table
│   ├── Filter Controls
│   └── Download Option
└── Settings Panel
    ├── Refresh Intervals
    └── Service Preferences
```

### 6.2 Data Fetching Strategy

**Polling Intervals:**

- Services Status: 3 seconds (frequent changes)
- Metrics: 5 seconds (enough for trends)
- Logs: 10 seconds (batch updates)
- Prometheus direct: 5 seconds (if available)

**State Management:**

- React hooks (useState, useEffect) for local state
- Or Redux/Zustand for global state
- Store last fetch time
- Handle duplicate updates

**Performance Optimization:**

- Debounce refresh requests
- Cache responses with timestamps
- Only update changed data
- Virtual scrolling for logs

---

## 7. Network & CORS Considerations

### 7.1 Backend (Port 8000)

- Serves all API endpoints
- No CORS issues for dashboard on 3000 (both same origin internally)
- Routes to other services

### 7.2 Prometheus Direct Access (Port 9090)

- May have CORS restrictions
- Solution: Use Backend as proxy
- Request flow: Dashboard → Backend → Prometheus

### 7.3 Loki Direct Access (Port 3100)

- May have CORS restrictions
- Solution: Use Backend as proxy
- Request flow: Dashboard → Backend → Loki

---

## 8. Real-Time vs Polling Trade-offs

### Polling Approach (Recommended for MVP)

**Pros:**

- Simple to implement
- No WebSocket complexity
- Better browser compatibility
- Easy to test
- Natural rate limiting

**Cons:**

- Slight delay in data display
- More network requests
- Higher load on backend

**Solution:** Adaptive polling

- Increase interval when no changes
- Decrease interval when changes detected
- Max interval: 30 seconds

### WebSocket Approach (Future)

**Pros:**

- True real-time updates
- Lower latency
- Bidirectional communication

**Cons:**

- More complex
- Connection management
- Requires server support

---

## 9. Error Handling Strategy

### 9.1 Service Unavailable

**When:** A service (Redis, Prometheus, etc.) is down
**Dashboard Shows:** Red status card with "Offline"
**Backend:** Returns status=false, uptime=0
**User Action:** Quick action to restart

### 9.2 API Endpoint Timeout

**When:** Backend API doesn't respond within 5 seconds
**Dashboard Shows:** "Loading..." spinner with retry button
**Retry Strategy:** Exponential backoff (1s, 2s, 4s)
**User Action:** Manual refresh or automatic retry

### 9.3 Partial Failure

**When:** Some services working, some down
**Dashboard Shows:** Mixed status
**Summary:** "3/7 services running"
**Details:** Individual service status for each

### 9.4 Prometheus/Loki Down

**When:** Metrics/logs unavailable
**Dashboard Shows:** Empty charts with "No data available"
**Fallback:** Show cached data if available
**User Action:** Restart service

---

## 10. Security Considerations

### 10.1 API Authentication

- Option 1: Session-based (cookies)
- Option 2: JWT tokens
- Option 3: API keys for service endpoints

### 10.2 Service Communication

- Internal services (Redis, Prometheus) can be on localhost only
- External access via Backend only
- NGINX can be reverse proxy

### 10.3 Data Exposure

- Don't expose sensitive metrics directly
- Filter logs for sensitive information
- Rate limit API endpoints

---

## 11. Implementation Roadmap

### Phase 1: Basic Service Status (Week 1)

- Implement `/api/v1/services/status` endpoint
- Create ServicesMonitor React component
- Display 7 services with basic status
- Polling every 3 seconds

### Phase 2: Metrics Integration (Week 2)

- Add `/metrics` endpoint with custom metrics
- Configure Prometheus scraping
- Create MetricsPanel with charts
- Integrate with Prometheus API

### Phase 3: Logs Integration (Week 3)

- Set up Loki + Promtail properly
- Add `/api/v1/logs` endpoint
- Create LogsViewer component
- Real-time log streaming

### Phase 4: Advanced Features (Week 4)

- WebSocket real-time updates
- Historical data visualization
- Alert configuration
- Custom dashboard widgets

---

## 12. Testing Strategy

### 12.1 Service Connection Testing

- Test each service port connectivity
- Verify response formats
- Timeout handling

### 12.2 API Endpoint Testing

- Test response times
- Error conditions
- Data format validation

### 12.3 Dashboard Component Testing

- Render correctness
- Data update behavior
- Error state display

### 12.4 Integration Testing

- End-to-end flow
- Service restart scenarios
- Network failure handling

---

## 13. Performance Targets

### Response Times

- Service status check: < 1 second
- Metrics query: < 2 seconds
- Logs query: < 3 seconds
- Dashboard render: < 500ms

### Network

- Polling traffic: ~10KB per request
- Reasonable bandwidth for monitoring

### Backend Load

- Should handle multiple concurrent requests
- Cache frequently accessed data
- Optimize database queries

---

## 14. Troubleshooting Guide

### Services Not Showing

**Issue:** Dashboard shows all services as offline
**Solution:**

1. Check if Backend API is running (port 8000)
2. Verify service ports are accessible
3. Check network connectivity
4. Review Backend logs

### Metrics Not Updating

**Issue:** Charts show no data
**Solution:**

1. Verify Prometheus is running (port 9090)
2. Check `/metrics` endpoint returns data
3. Verify Prometheus scraping configuration
4. Check backend service metrics code

### Logs Not Appearing

**Issue:** No logs in dashboard
**Solution:**

1. Verify Loki is running (port 3100)
2. Check Promtail is shipping logs
3. Verify log file paths configured
4. Check Loki storage directory

### Slow Performance

**Issue:** Dashboard is laggy
**Solution:**

1. Increase polling intervals
2. Reduce data points (limit logs/metrics)
3. Implement caching
4. Check backend resource usage

---

## 15. Summary: Integration Flow Diagram

```
[Services Running]
  ├─ Redis (6379)
  ├─ Prometheus (9090)
  ├─ Loki (3100)
  ├─ Promtail
  ├─ NGINX (80)
  └─ [Application Metrics Generated]
        │
        ↓
  [Backend API (8000)]
    ├─ /metrics → Prometheus scrapes
    ├─ /api/v1/services/status → Check all services
    ├─ /api/v1/metrics → Query Prometheus
    └─ /api/v1/logs → Query Loki
        │
        ↓
  [Dashboard (3000)]
    ├─ ServicesMonitor (polls every 3s)
    ├─ MetricsPanel (polls every 5s)
    └─ LogsViewer (polls every 10s)
        │
        ↓
  [Real-Time Data Display]
    ├─ Service status cards
    ├─ Performance metrics charts
    └─ Log entries stream
```

---

## Next Steps

1. **Implement Backend Endpoints** - Create service checking logic
2. **Add Metrics Collection** - Instrument application code
3. **Create React Components** - Build dashboard UI
4. **Configure Prometheus** - Set up scraping
5. **Set up Loki + Promtail** - Configure log aggregation
6. **Test End-to-End** - Verify complete flow
7. **Optimize Performance** - Fine-tune intervals and caching
8. **Add Error Handling** - Graceful degradation

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Status:** Architecture & Strategy Guide (Ready for Implementation)
