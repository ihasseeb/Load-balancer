# 📊 AI Load Balancing Dashboard

Modern, real-time dashboard for monitoring and controlling the AI-powered load balancer. Built with React, TypeScript, and Vite.

## ✨ Features

- **📈 Real-time Monitoring**: Live service status and performance metrics
- **🎛️ Service Control**: Start/Stop services directly from the dashboard
- **📊 Interactive Charts**: Visualize traffic patterns and performance
- **📝 Log Viewer**: Real-time log streaming and filtering
- **🎨 Modern UI**: Clean, responsive design with smooth animations
- **⚡ Fast Performance**: Built with Vite for lightning-fast development

## 🏗️ Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── common/       # Shared components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── metrics/      # Metrics components
│   │   └── services/     # Service management components
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Services.tsx
│   │   ├── Metrics.tsx
│   │   └── Logs.tsx
│   ├── api/              # API client
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── nginx.conf            # NGINX configuration for production
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   
   Dashboard will be available at: `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📱 Pages

### Dashboard
- Overview of all services
- Real-time status indicators
- Quick stats and metrics

### Services Monitor
- List of all registered services
- Start/Stop controls
- Service health indicators
- Response time tracking

### Metrics & Analytics
- Traffic distribution charts
- Performance graphs
- Historical data visualization
- Custom time range selection

### Logs & Events
- Real-time log streaming
- Log level filtering
- Search functionality
- Export capabilities

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **TailwindCSS** (optional) - Styling

## 🐳 Docker

### Build Image
```bash
docker build -t natours-dashboard .
```

### Run Container
```bash
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://localhost:8000/api/v1 \
  natours-dashboard
```

## 🔧 Configuration

### API Base URL

The dashboard connects to the backend API. Configure the base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

For production, update to your production API URL.

## 📊 API Integration

The dashboard communicates with the backend API for:

- Service status and control
- Real-time metrics
- Log streaming
- Configuration management

See `src/api/` for API client implementation.

## 🧪 Testing

```bash
npm run test
```

## 🏗️ Building

```bash
# Development build
npm run build

# Preview production build
npm run preview
```

## 📝 Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation menu

### Adding New Components

1. Create component in appropriate `src/components/` subdirectory
2. Export from component file
3. Import where needed

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

## 👨‍💻 Author

HaseeB