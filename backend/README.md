# 🔵 Natours Backend API

AI-Powered Load Balancer Backend with Machine Learning-based traffic distribution, real-time monitoring, and intelligent request routing.

## 📋 Features

- **🤖 AI-Powered Load Balancing**: ML models for intelligent traffic distribution
- **📊 Real-time Metrics**: Prometheus integration for performance monitoring
- **📝 Centralized Logging**: Winston + Loki for comprehensive log aggregation
- **🔐 Authentication & Authorization**: JWT-based secure access control
- **⚡ Rate Limiting**: Redis-backed rate limiting and caching
- **🏥 Health Checks**: Comprehensive health monitoring endpoints
- **🎯 SQLite Database**: Lightweight, embedded database for monitoring data

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── routes/           # API routes
│   │   └── index.js      # Central route aggregator
│   ├── models/           # Data models
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── ml-models/        # Machine Learning models
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── data/                 # SQLite database
├── logs/                 # Application logs
├── dev-data/             # Development data
├── tests/                # Backend tests
├── .env.example          # Environment variables template
├── Dockerfile            # Docker configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Redis (for rate limiting)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

4. **Run in production mode**:
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Health & Monitoring
- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/metrics` - Prometheus metrics
- `GET /api/v1/logs` - Application logs

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Password reset

### Services Management
- `GET /api/v1/services` - List all services
- `POST /api/v1/services` - Register new service
- `GET /api/v1/services/:id` - Get service details
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Remove service

### Load Balancer
- `POST /api/v1/load-balancer/route` - Route request to backend
- `GET /api/v1/load-balancer/stats` - Get routing statistics

### AI Services
- `POST /api/v1/ai-services/predict` - ML prediction endpoint
- `GET /api/v1/ai-services/models` - List available models

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=production
PORT=8000
DB_PATH=/app/data/monitoring.db
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=90d
```

## 🐳 Docker

### Build Image
```bash
docker build -t natours-backend .
```

### Run Container
```bash
docker run -p 8000:8000 \
  -e NODE_ENV=production \
  -e REDIS_HOST=redis \
  natours-backend
```

## 📊 Monitoring

### Prometheus Metrics
Access metrics at: `http://localhost:8000/api/v1/metrics`

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

## 🧪 Testing

```bash
npm test
```

## 📝 Logging

Logs are stored in `./logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `natour-log.json` - JSON formatted logs for Loki

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

## 👨‍💻 Author

HaseeB
