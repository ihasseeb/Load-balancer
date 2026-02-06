// services/aiDecision.js
const tf = require('@tensorflow/tfjs'); // Using pure JS implementation
const fs = require('fs');

async function getRoutingDecision(inputData) {
  try {
    // load your pre-trained ML/AI model
    const model = await tf.loadLayersModel('file://model/model.json');

    // preprocess inputData as per model requirement
    const tensorInput = tf.tensor2d([inputData]);

    const prediction = model.predict(tensorInput);
    const decision = prediction.argMax(-1).dataSync()[0];

    // Cleanup tensors to prevent memory leaks
    tensorInput.dispose();
    prediction.dispose();

    return decision; // 0 = route A, 1 = route B, etc.
  } catch (error) {
    console.error('Error in getRoutingDecision:', error);
    // Fallback to round-robin (decision 0) if model loading fails
    return 0;
  }
}

module.exports = { getRoutingDecision };
