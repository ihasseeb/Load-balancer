const os = require('os');
const client = require('prom-client');
const { sendToAIDecisionEngine } = require('./aiController');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const cpuGauge = new client.Gauge({
  name: 'system_cpu_usage',
  help: 'CPU usage %'
});
const memGauge = new client.Gauge({
  name: 'system_memory_usage',
  help: 'Memory usage %'
});
const reqGauge = new client.Counter({
  name: 'api_request_count',
  help: 'Number of API requests'
});

exports.collectSystemMetrics = async () => {
  const cpuLoad = os.loadavg()[0];
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((totalMem - freeMem) / totalMem) * 100;

  cpuGauge.set(cpuLoad);
  memGauge.set(memUsage);

  return { cpuUsage: cpuLoad, memoryUsage: memUsage };
};

exports.getPrometheusMetrics = async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};

exports.triggerAI = async (req, res) => {
  const metrics = await exports.collectSystemMetrics();
  const result = await sendToAIDecisionEngine(metrics);
  res.json({ metrics, aiDecision: result });
};

exports.reqGauge = reqGauge;
