// AI Services Routes - Real-time AI decision logs and analytics
const express = require('express');
const router = express.Router();
const {
  getSystemLogs,
  getRecentRequests,
  getStats
} = require('../config/sqlite');

// 🤖 AI Services - Real-time logs with auto-refresh capability
router.get('/ai-services', (req, res) => {
  try {
    const limit = req.query.limit || 50;

    // Get recent system logs (AI decisions, processing results)
    const systemLogs = getSystemLogs(limit);

    // Get recent API requests (for context)
    const recentRequests = getRecentRequests(Math.floor(limit / 2));

    // Get statistics
    const stats = getStats();

    // Format logs for display
    const formattedLogs = systemLogs.map(log => ({
      id: log.id,
      timestamp: new Date(log.created_at).toLocaleString(),
      level: log.level,
      message: log.message,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    // Format requests for AI context
    const formattedRequests = recentRequests.map(req => ({
      id: req.id,
      timestamp: new Date(req.created_at).toLocaleString(),
      method: req.method,
      endpoint: req.endpoint,
      status: req.status,
      responseTime: req.response_time,
      aiDecision: req.ai_decision,
      userEmail: req.user_email
    }));

    res.status(200).json({
      service: 'AI Load Balancer',
      status: 'ACTIVE',
      logs: {
        count: formattedLogs.length,
        data: formattedLogs
      },
      recentRequests: {
        count: formattedRequests.length,
        data: formattedRequests
      },
      statistics: {
        totalRequests: stats.total_requests || 0,
        successCount: stats.success_count || 0,
        errorCount: stats.error_count || 0,
        averageResponseTime: stats.avg_response_time || 0
      },
      timestamp: new Date().toISOString(),
      // Add refresh interval info
      refreshInterval: {
        value: 5,
        unit: 'seconds',
        note: 'Data auto-refreshes every 5 seconds in UI'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching AI services data:', error);
    res.status(500).json({
      error: error.message,
      service: 'AI Load Balancer',
      status: 'ERROR'
    });
  }
});

// 🤖 AI Services - Detailed logs endpoint
router.get('/ai-services/logs', (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const level = req.query.level; // Filter by level (INFO, ERROR, WARNING, etc.)

    let logs = getSystemLogs(limit);

    // Filter by level if specified
    if (level) {
      logs = logs.filter(log => log.level === level.toUpperCase());
    }

    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: new Date(log.created_at).toLocaleString(),
      level: log.level,
      message: log.message,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    res.status(200).json({
      count: formattedLogs.length,
      logs: formattedLogs,
      filters: {
        level: level || 'all',
        limit
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🤖 AI Services - Health check
router.get('/ai-services/health', (req, res) => {
  try {
    const stats = getStats();

    const successRate =
      stats.total_requests > 0
        ? ((stats.success_count / stats.total_requests) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      service: 'AI Load Balancer',
      status: 'HEALTHY',
      health: {
        uptime: Math.floor(process.uptime()),
        successRate: `${successRate}%`,
        totalRequests: stats.total_requests || 0,
        errorCount: stats.error_count || 0,
        avgResponseTime: `${stats.avg_response_time || 0}ms`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching health:', error);
    res.status(500).json({
      service: 'AI Load Balancer',
      status: 'UNHEALTHY',
      error: error.message
    });
  }
});

module.exports = router;
