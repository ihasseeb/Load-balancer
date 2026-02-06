const express = require('express');
const router = express.Router();
const { getRecentMetrics } = require('../config/sqlite');

// Metrics endpoint - Dashboard ko performance data provide karta hai
router.get('/metrics', (req, res) => {
  res.status(200).json({
    requests: {
      total: global.totalRequests || 0,
      success: global.successRequests || 0,
      failed: global.failedRequests || 0
    },
    responseTime: {
      average: global.avgResponseTime || 0,
      min: global.minResponseTime || 0,
      max: global.maxResponseTime || 0
    },
    activeConnections: global.activeConnections || 0,
    timestamp: new Date().toISOString()
  });
});

// Detailed metrics endpoint
router.get('/metrics/detailed', (req, res) => {
  res.status(200).json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    requests: {
      total: global.totalRequests || 0,
      success: global.successRequests || 0,
      failed: global.failedRequests || 0,
      successRate:
        global.totalRequests > 0
          ? ((global.successRequests / global.totalRequests) * 100).toFixed(2)
          : 0
    },
    performance: {
      avgResponseTime: global.avgResponseTime || 0,
      minResponseTime: global.minResponseTime || 0,
      maxResponseTime: global.maxResponseTime || 0,
      recentResponseTimes: global.responseTimes || []
    },
    connections: {
      active: global.activeConnections || 0,
      total: global.totalConnections || 0
    },
    timestamp: new Date().toISOString()
  });
});

// 📊 Real-time System Metrics from Database
router.get('/metrics/system', (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const metrics = getRecentMetrics(limit);

    // Helper function to format metrics
    const formatMetricData = metricName => {
      return metrics
        .filter(m => m.metric_name === metricName)
        .map(m => ({
          timestamp: new Date(m.timestamp).toLocaleTimeString(),
          value: parseFloat(m.metric_value)
        }));
    };

    // Format all metrics
    const cpuData = formatMetricData('cpu_usage');
    const memoryData = formatMetricData('memory_usage');
    const diskData = formatMetricData('disk_usage');
    const errorRateData = formatMetricData('error_rate');
    const rpsData = formatMetricData('requests_per_second');
    const networkData = formatMetricData('network_io_bytes');
    const uptimeData = formatMetricData('process_uptime');
    const connectionsData = formatMetricData('active_connections');

    // Get latest values
    const getLatestValue = data =>
      data.length > 0 ? data[data.length - 1]?.value : 0;

    res.status(200).json({
      system: {
        cpu: {
          latest: getLatestValue(cpuData),
          unit: '%',
          history: cpuData
        },
        memory: {
          latest: getLatestValue(memoryData),
          unit: '%',
          history: memoryData
        },
        disk: {
          latest: getLatestValue(diskData),
          unit: '%',
          history: diskData
        }
      },
      performance: {
        errorRate: {
          latest: getLatestValue(errorRateData),
          unit: '%',
          history: errorRateData
        },
        rps: {
          latest: getLatestValue(rpsData),
          unit: 'req/s',
          history: rpsData
        },
        networkIO: {
          latest: getLatestValue(networkData),
          unit: 'bytes',
          history: networkData
        }
      },
      health: {
        uptime: {
          latest: getLatestValue(uptimeData),
          unit: 'seconds',
          history: uptimeData
        },
        activeConnections: {
          latest: getLatestValue(connectionsData),
          unit: 'connections',
          history: connectionsData
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching system metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
