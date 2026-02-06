const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const client = require('prom-client');
const responseTime = require('response-time');
const { createLogger, format, transports } = require('winston');
const LokiTransport = require('winston-loki');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const loadBalancerRouter = require('./routes/loadBalancer'); // Fixed name
const healthRoutes = require('./routes/healthRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const serverRoutes = require('./routes/serverRoutes');
const logsRoutes = require('./routes/logsRoutes');
const aiServicesRoutes = require('./routes/aiServicesRoutes');
const servicesRoutes = require('./routes/servicesRoutes');
const authRouter = require('./routes/authRoutes');

// Import utilities
const { extractUserInfo } = require('./middleware/extractUserInfo');

// Start express app
const app = express();

app.enable('trust proxy');

//-------------------------------------------------------------//
// 🧠 1-Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🧠 Winston Logger (Structured Logging + Loki + File)
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'natour-log.json'),
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      options: { flags: 'a' }
    }),
    new LokiTransport({
      host: 'http://loki:3100',
      labels: { app: 'adaptive-load-balancer' }
    })
  ]
});

// 📊 2) PROMETHEUS METRICS SETUP
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const reqResTime = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 50, 100, 200, 400, 600, 800, 1000, 2000]
});

// 1) GLOBAL MIDDLEWARES
app.use(cors());
app.options('*', cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 📊 Health and Metrics Routes (No rate limiting)
app.use('/api/v1', healthRoutes);
app.use('/api/v1', metricsRoutes);

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(
  responseTime((req, res, time) => {
    reqResTime
      .labels({
        method: req.method,
        route: req.route ? req.route.path : req.originalUrl,
        status_code: res.statusCode
      })
      .observe(time);
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
  })
);

app.use(extractUserInfo);
app.use(express.static(path.join(__dirname, 'public')));

// 3) ROUTES
app.get('/', (req, res) => {
  logger.info('Accessing root / endpoint');
  res.status(200).json({
    status: 'success',
    message: '🚀 Adaptive Load Balancer API running smoothly!'
  });
});

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

app.use('/api/v1', serverRoutes);
app.use('/api/v1', servicesRoutes);
app.use('/api/v1/logs', logsRoutes);
app.use('/api/v1', aiServicesRoutes);
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/loadbalancer', loadBalancerRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
