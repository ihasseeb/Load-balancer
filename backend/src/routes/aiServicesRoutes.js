// AI Services Routes - Real-time AI decision logs and analytics
const express = require('express');
const router = express.Router();
const {
  getSystemLogs,
  getRecentRequests,
  getRecentAiPolicies,
  getRecentMetrics,
  getStats,
  getServerDistribution
} = require('../config/sqlite');

// 🤖 AI Services - The "Heartbeat" of the Dashboard
router.get('/ai-services', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    // 1. Get raw system logs
    const systemLogs = getSystemLogs(20);

    // 2. Get structured AI decisions (The 4 models)
    const aiPolicies = getRecentAiPolicies(10);

    // 3. Get real traffic logs
    const recentRequests = getRecentRequests(limit);

    // 4. Get Metrics History for Charts (RPS, CPU, Memory)
    const rawMetrics = getRecentMetrics(100);

    // 5. Get Aggregate Statistics
    const stats = getStats();

    // 6. Get Server Distribution (for Pie Chart)
    const serverDistribution = getServerDistribution();

    // --- Data Formatting ---

    // Format metrics for charts (Grouping by name)
    const metricsHistory = {
      rps: rawMetrics.filter(m => m.metric_name === 'requests_per_second').map(m => ({
        time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00',
        value: parseFloat(m.metric_value)
      })),
      cpu: rawMetrics.filter(m => m.metric_name === 'cpu_usage').map(m => ({
        time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00',
        value: parseFloat(m.metric_value)
      })),
      memory: rawMetrics.filter(m => m.metric_name === 'memory_usage').map(m => ({
        time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '00:00:00',
        value: parseFloat(m.metric_value)
      }))
    };

    // Format AI Policy Insight Data
    const formattedAiInsights = aiPolicies.map(p => ({
      id: p.id,
      timestamp: p.timestamp,
      metrics: { cpu: p.cpu_usage, memory: p.memory_usage, requests: p.request_count },
      decisions: { primary: p.recommended_server, secondary: p.rf_recommendation, algorithm: p.algorithm, confidence: p.confidence },
      security: { isAnomaly: p.is_anomaly === 1, threatLevel: p.threat_level },
      forecast: { predictedLoad: p.predicted_load, action: p.scaling_action }
    }));

    // Format real requests for Table
    const formattedRequests = recentRequests.map(req => ({
      id: req.id,
      timestamp: req.timestamp,
      method: req.method,
      endpoint: req.endpoint,
      status: req.status,
      responseTime: req.response_time,
      aiDecision: req.ai_decision,
      ip: req.ip || '0.0.0.0',
      device: req.device || 'Desktop',
      source: req.source || 'Direct'
    }));

    // Format Logs for recent actions
    const formattedLogs = systemLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp || new Date(log.created_at).toLocaleTimeString(),
      level: log.level,
      message: log.message
    }));

    res.status(200).json({
      service: 'AI Load Balancer',
      status: 'ACTIVE',
      metricsHistory,
      aiInsights: formattedAiInsights,
      serverDistribution, // Real pie chart data
      recentRequests: { count: formattedRequests.length, data: formattedRequests },
      logs: { count: formattedLogs.length, data: formattedLogs },
      statistics: {
        totalRequests: stats.total_requests || 0,
        successCount: stats.success_count || 0,
        errorCount: stats.error_count || 0,
        avgResponseTime: stats.avg_response_time || 0,
        uniqueVisitors: stats.unique_visitors || 0,
        totalBytes: stats.total_bytes || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching AI services data:', error);
    res.status(500).json({ status: 'error', message: error.message });
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
        successRate: `${successRate}% `,
        totalRequests: stats.total_requests || 0,
        errorCount: stats.error_count || 0,
        avgResponseTime: `${stats.avg_response_time || 0} ms`
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
