const client = require('prom-client');
const metricsCollector = require('../services/metricsCollector');
const { sendToAIDecisionEngine } = require('./aiController');

// Registry is handled globally by prom-client
const reqGauge = new client.Counter({
  name: 'api_request_count',
  help: 'Number of API requests'
});

exports.collectSystemMetrics = async () => {
  return metricsCollector.getCurrentMetrics();
};

exports.getPrometheusMetrics = async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};

exports.triggerAI = async (req, res) => {
  const metrics = metricsCollector.getCurrentMetrics();

  // Map our metrics to names expected by AI Flask API if needed
  const aiInput = {
    request_count: parseInt(metrics.rps * 60) || 0, // Approx requests per min
    avg_response_time: parseFloat(metrics.responseTime) || 0.1,
    error_rate: parseFloat(metrics.errorRate) / 100 || 0,
    bot_rate: 0.05, // Placeholder if not tracked
    hour: new Date().getHours(),
    weekday: new Date().getDay(),
    cpuUsage: parseFloat(metrics.cpu),
    memoryUsage: parseFloat(metrics.memory)
  };

  const result = await sendToAIDecisionEngine(aiInput);
  res.json({ systemMetrics: metrics, aiDecision: result });
};

exports.reqGauge = reqGauge;
