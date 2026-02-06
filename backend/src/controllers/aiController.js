const axios = require('axios');
const Policy = require('../models/policyModel');
const logger = require('../utils/logger');

exports.sendToAIDecisionEngine = async metrics => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', metrics);
    const data = response.data;

    await Policy.create({
      timestamp: new Date(),
      ...metrics,
      predictedScale: data.scale_factor,
      predictedRateLimit: data.rate_limit
    });

    logger.info(`🧠 AI Policy Received: ${JSON.stringify(data)}`);
    return data;
  } catch (err) {
    logger.error(`AI Engine Error: ${err.message}`);
  }
};
