const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');
const metricsCollector = require('./services/metricsCollector');
const logGenerator = require('./services/logGenerator');
const randomDataGenerator = require('./services/randomDataGenerator');

dotenv.config({ path: './config.env' });

// 🗄️ Connect Database (Optional - SQLite is primary)
if (process.env.DATABASE && process.env.DATABASE_PASSWORD) {
  const db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );

  // Try to connect to MongoDB, but don't crash if it fails
  connectDB(db).catch(err => {
    console.log('⚠️  MongoDB connection failed - using SQLite only');
  });
} else {
  console.log('ℹ️  No MongoDB credentials found - operating with SQLite only');
}

// 🚀 Start Server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`🚀 Service running on port ${port}`);
  logger.info(`Log & Metrics service started on port ${port}`);

  // 📊 Start automatic metrics collection
  metricsCollector.start();

  // 📝 Start random log generation
  logGenerator.start();

  // 📊 Start random data generation for testing
  randomDataGenerator.start();
});

// 🧹 Graceful Shutdown
process.on('unhandledRejection', err => {
  console.error('❌ UNHANDLED REJECTION!', err);
  metricsCollector.stop();
  logGenerator.stop();
  randomDataGenerator.stop();
  server.close(() => process.exit(1));
});

process.on('uncaughtException', err => {
  console.error('💥 UNCAUGHT EXCEPTION!', err);
  metricsCollector.stop();
  logGenerator.stop();
  randomDataGenerator.stop();
  metricsCollector.stop();
  server.close(() => process.exit(1));
});
