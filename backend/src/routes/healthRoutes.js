const express = require('express');
const router = express.Router();

// Health check endpoint - Dashboard ko batata hai ke server chal raha hai
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    uptime: process.uptime(), // Server kitni der se chal raha hai
    memory: process.memoryUsage(), // Memory usage
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
