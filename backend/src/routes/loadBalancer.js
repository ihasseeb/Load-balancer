// routes/loadBalancer.js
const express = require('express');
const router = express.Router();
const { getRoutingDecision } = require('../services/aiDecision');

router.post('/route', async (req, res, next) => {
    try {
        const inputData = req.body; // e.g., current load, request type
        const decision = await getRoutingDecision(inputData);

        // Apply decision in your app logic
        let route = '';
        switch (decision) {
            case 0: route = 'Server A'; break;
            case 1: route = 'Server B'; break;
            default: route = 'Default Server';
        }

        res.status(200).json({ route, decision });
    } catch (err) {
        next(err); // global error handler
    }
});

module.exports = router;
