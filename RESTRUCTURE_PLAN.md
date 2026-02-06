# 🏗️ Project Restructuring Plan

## Current Structure Issues
- Frontend and Backend mixed together
- Config files scattered in root
- No clear separation of concerns
- Documentation files in root directory

## New Professional Structure

```
natours-load-balancer/
│
├── 📁 backend/                          # Backend API Service
│   ├── src/
│   │   ├── config/                      # Configuration files
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   └── environment.js
│   │   ├── controllers/                 # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── tour.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── metrics.controller.js
│   │   │   ├── logs.controller.js
│   │   │   └── ai.controller.js
│   │   ├── routes/                      # API routes
│   │   │   ├── index.js                 # Route aggregator
│   │   │   ├── auth.routes.js
│   │   │   ├── tour.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── services.routes.js
│   │   │   ├── metrics.routes.js
│   │   │   ├── logs.routes.js
│   │   │   ├── health.routes.js
│   │   │   └── loadbalancer.routes.js
│   │   ├── models/                      # Data models
│   │   │   ├── user.model.js
│   │   │   └── tour.model.js
│   │   ├── middleware/                  # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   ├── services/                    # Business logic
│   │   │   ├── loadBalancer.service.js
│   │   │   ├── metrics.service.js
│   │   │   └── logger.service.js
│   │   ├── ml-models/                   # Machine Learning models
│   │   │   ├── predictive/
│   │   │   ├── reinforcement/
│   │   │   └── utils/
│   │   ├── utils/                       # Utility functions
│   │   │   ├── apiFeatures.js
│   │   │   ├── catchAsync.js
│   │   │   └── appError.js
│   │   ├── app.js                       # Express app setup
│   │   └── server.js                    # Server entry point
│   ├── data/                            # SQLite database
│   ├── logs/                            # Application logs
│   ├── dev-data/                        # Development data
│   ├── tests/                           # Backend tests
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── 📁 frontend/                         # React Dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/                  # React components
│   │   │   ├── common/                  # Shared components
│   │   │   ├── dashboard/
│   │   │   ├── metrics/
│   │   │   └── services/
│   │   ├── pages/                       # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Metrics.tsx
│   │   │   └── Logs.tsx
│   │   ├── api/                         # API client
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── utils/                       # Utility functions
│   │   ├── types/                       # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── 📁 docker/                           # Docker configurations
│   ├── nginx/
│   │   └── nginx.conf
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── loki/
│   │   └── loki-config.yaml
│   └── promtail/
│       └── promtail-config.yaml
│
├── 📁 docs/                             # Documentation
│   ├── architecture/
│   │   ├── ARCHITECTURE_FLOW_DIAGRAM.md
│   │   ├── SQLITE_ARCHITECTURE.md
│   │   └── architecture-diagram.html
│   ├── guides/
│   │   ├── TESTING_GUIDE.md
│   │   ├── SERVICES_INTEGRATION_GUIDE.md
│   │   └── NO_DOCKER_SOLUTION.md
│   ├── summaries/
│   │   ├── COMPLETE_INTEGRATION_SUMMARY.md
│   │   ├── ML_MODELS_COMPLETE_SUMMARY.md
│   │   └── SQLITE_SETUP_SUMMARY.md
│   └── roadmaps/
│       ├── SCALING_AND_ML_ROADMAP.md
│       └── FYP_ALGORITHM_SELECTION.md
│
├── 📁 scripts/                          # Utility scripts
│   ├── setup-tools.ps1
│   ├── start-all-services.ps1
│   ├── start-services-monitor.ps1
│   └── stop-all-services.ps1
│
├── 📁 .github/                          # GitHub workflows (optional)
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── docker-compose.yml                   # Main compose file
├── docker-compose.dev.yml               # Development overrides
├── docker-compose.prod.yml              # Production overrides
├── .gitignore
├── .prettierrc
├── .eslintrc.json
└── README.md                            # Main project README

```

## Migration Steps

### Phase 1: Create New Directory Structure
1. Create `backend/` and `frontend/` directories
2. Create `docker/`, `docs/`, `scripts/` directories

### Phase 2: Move Backend Files
1. Move all backend source files to `backend/src/`
2. Move `package.json`, `Dockerfile` to `backend/`
3. Update import paths in all files

### Phase 3: Move Frontend Files
1. Move `AI Load Balancing Dashboard/` contents to `frontend/`
2. Update API base URLs
3. Update build configurations

### Phase 4: Organize Docker Configs
1. Move all Docker configs to `docker/` directory
2. Update docker-compose.yml volume paths

### Phase 5: Organize Documentation
1. Move all `.md` and `.txt` docs to `docs/`
2. Organize by category

### Phase 6: Update Configurations
1. Update docker-compose.yml paths
2. Update Dockerfile paths
3. Update nginx configs
4. Update environment variables

### Phase 7: Testing
1. Test backend independently
2. Test frontend independently
3. Test full stack with Docker Compose

## Benefits

✅ **Clear Separation**: Frontend and Backend completely separated
✅ **Scalability**: Easy to add microservices
✅ **Maintainability**: Organized code structure
✅ **Professional**: Industry-standard monorepo structure
✅ **Docker Ready**: Clean Docker build contexts
✅ **Team Friendly**: Easy for multiple developers to work
✅ **CI/CD Ready**: Easy to set up automated pipelines
