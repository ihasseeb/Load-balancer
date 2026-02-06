const logger = require('../utils/logger');
const { reqGauge } = require('./metricController');

exports.receiveLogs = async (req, res) => {
  reqGauge.inc();
  logger.info(req.body);
  res.status(200).json({ status: 'success', message: 'Log received' });
};
