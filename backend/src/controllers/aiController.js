const axios = require('axios');
const { saveAiPolicy } = require('../config/sqlite');
const logger = require('../utils/logger');

exports.sendToAIDecisionEngine = async metrics => {
  try {
    const aiUrl = process.env.AI_API_URL || 'http://127.0.0.1:5000/predict';
    const response = await axios.post(aiUrl, metrics);
    const data = response.data;

    // Save decision to Database for history/dashboard
    await saveAiPolicy({
      timestamp: new Date().toISOString(),

      // Input metrics
      cpuUsage: metrics.cpuUsage,
      memoryUsage: metrics.memoryUsage,
      requestCount: metrics.request_count,
      errorRate: metrics.error_rate,

      // AI Decisions (XGBoost + Comparison RF)
      recommendedServer: data.decision.recommended_server,
      confidence: data.decision.confidence,
      algorithm: data.decision.algorithm,
      rfRecommendation: data.decision.comparison ? data.decision.comparison.random_forest : 'Unknown',
      rfConfidence: data.decision.comparison ? data.decision.comparison.rf_confidence : 0,

      // Security (Anomaly Detection)
      isAnomaly: data.security.is_anomaly,
      threatLevel: data.security.threat_level,

      // Forecast (LSTM)
      predictedLoad: data.forecast.predicted_next_min_load,
      scalingAction: data.forecast.scaling_action
    });

    logger.info(`🧠 AI Policy Updated: ${data.decision.recommended_server} (Confidence: ${(data.decision.confidence * 100).toFixed(2)}%)`);
    return data;
  } catch (err) {
    logger.error(`AI Engine Error: ${err.message}`);
    return { error: err.message, status: "failed" };
  }
};
