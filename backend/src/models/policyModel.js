const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Input Metrics
  cpuUsage: Number,
  memoryUsage: Number,
  requestCount: Number,
  errorRate: Number,
  responseTime: Number,
  
  // AI Decisions
  recommendedServer: String,
  confidence: Number,
  algorithm: String,
  
  // Security Analysis
  isAnomaly: Boolean,
  threatLevel: String,
  
  // Forecast
  predictedNextMinLoad: Number,
  scalingAction: String,
  
  // Metadata
  status: {
    type: String,
    enum: ['applied', 'pending', 'failed'],
    default: 'applied'
  }
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
