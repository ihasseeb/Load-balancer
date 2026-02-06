# 🚀 Natours AI Load Balancer

A production-ready, AI-powered load balancing system with real-time monitoring, machine learning-based traffic distribution, and a modern React dashboard.

## 📋 Overview

This project implements an intelligent load balancer that uses machine learning algorithms to optimize traffic distribution across multiple backend services. It includes comprehensive monitoring, logging, and a real-time dashboard for service management.

## ✨ Key Features

- **🤖 AI-Powered Load Balancing**: ML models for intelligent request routing
- **📊 Real-time Dashboard**: Modern React UI for monitoring and control
- **📈 Metrics & Monitoring**: Prometheus integration for performance tracking
- **📝 Centralized Logging**: Loki + Promtail for log aggregation
- **🔐 Security**: JWT authentication, rate limiting, and request sanitization
- **⚡ High Performance**: Redis caching and optimized routing algorithms
- **🐳 Docker Ready**: Complete containerization with docker-compose
- **🏥 Health Checks**: Comprehensive health monitoring for all services

## 🏗️ Project Structure

```
natours-load-balancer/
│
├── 📁 backend/                    # Backend API Service
│   ├── src/
│   │   ├── config/                # Configuration
│   │   ├── controllers/           # Route controllers
│   │   ├── routes/                # API routes
│   │   ├── models/                # Data models
│   │   ├── middleware/            # Express middleware
│   │   ├── services/              # Business logic
│   │   ├── ml-models/             # ML models
│   │   ├── utils/                 # Utilities
│   │   ├── app.js                 # Express app
│   │   └── server.js              # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── 📁 frontend/                   # React Dashboard
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── api/                   # API client
│   │   ├── hooks/                 # Custom hooks
│   │   └── App.tsx                # Main app
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── 📁 docker/                     # Docker configurations
│   ├── nginx/
│   │   └── nginx.conf
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── loki/
│   │   └── loki-config.yaml
│   └── promtail/
│       └── promtail-config.yaml
│
├── 📁 docs/                       # Documentation
│   ├── architecture/              # Architecture docs
│   ├── guides/                    # Setup guides
│   ├── summaries/                 # Project summaries
│   └── roadmaps/                  # Future roadmaps
│
├── 📁 scripts/                    # Utility scripts
│   ├── setup-tools.ps1
│   ├── start-all-services.ps1
│   └── stop-all-services.ps1
│
├── docker-compose.yml             # Main compose file
├── .gitignore
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- Node.js >= 18 (for local development)

### 🐳 Using Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd natours-load-balancer
   ```

2. **Start all services**:
   ```bash
   docker compose up -d --build
   ```

3. **Access the services**:
   - Dashboard: http://localhost:3000
   - Backend API: http://localhost:8000
   - Prometheus: http://localhost:9090
   - Loki: http://localhost:3100

4. **Stop all services**:
   ```bash
   docker compose down
   ```

### 💻 Local Development

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on: http://localhost:8000

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## 📡 Services Architecture

```
┌─────────────────┐
│   NGINX Proxy   │ :80
│  (Entry Point)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼──┐  ┌────▼────┐ ┌──▼──────┐
│Backend│ │Dash │  │Prometh  │ │  Loki   │
│  API  │ │board│  │  eus    │ │         │
│ :8000 │ │:3000│  │  :9090  │ │  :3100  │
└───┬───┘ └─────┘  └─────────┘ └─────────┘
    │
┌───▼───┐
│ Redis │
│ :6379 │
└───────┘
```

## 📊 API Endpoints

### Health & Monitoring
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Prometheus metrics
- `GET /api/v1/logs` - Application logs

### Services
- `GET /api/v1/services` - List services
- `POST /api/v1/services` - Register service
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Remove service

### Load Balancer
- `POST /api/v1/load-balancer/route` - Route request
- `GET /api/v1/load-balancer/stats` - Statistics

See [backend/README.md](backend/README.md) for complete API documentation.

## 📈 Monitoring

### Prometheus Metrics
Access at: http://localhost:9090

Available metrics:
- Request count and duration
- Service health status
- Load balancer performance
- System resources

### Logs (Loki)
Access at: http://localhost:3100

Log levels:
- `error` - Error logs
- `warn` - Warning logs
- `info` - Info logs
- `debug` - Debug logs

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Documentation

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [Architecture Guide](docs/architecture/)
- [Setup Guides](docs/guides/)

## 🛠️ Development

### Adding New Features

1. Create feature branch
2. Implement in appropriate service (backend/frontend)
3. Update tests
4. Update documentation
5. Submit pull request

### Code Style

- Backend: ESLint + Prettier (Airbnb style)
- Frontend: ESLint + Prettier (React/TypeScript)

## 🐛 Troubleshooting

### Docker Issues

```bash
# View logs
docker compose logs -f [service-name]

# Restart service
docker compose restart [service-name]

# Rebuild service
docker compose up -d --build [service-name]
```

### Common Issues

1. **Port already in use**: Change port mappings in `docker-compose.yml`
2. **Container won't start**: Check logs with `docker compose logs`
3. **Database connection failed**: Ensure Redis is running

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ISC

## 👨‍💻 Author

**HaseeB**

## 🙏 Acknowledgments

- Express.js for the backend framework
- React for the frontend framework
- Prometheus for metrics
- Loki for log aggregation
- Docker for containerization

---

**⭐ Star this repository if you find it helpful!**
