const express = require('express');
const router = express.Router();
const { getRecentRequests, getRequestStats } = require('../config/sqlite');

// GET /api/v1/logs - Fetch recent logs from SQLite database
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        // Fetch recent requests from SQLite
        const requests = getRecentRequests(limit);

        // Format data for dashboard compatibility
        const formattedLogs = requests.map(request => ({
            id: request.id,
            timestamp: request.timestamp,
            ip: request.ip,
            method: request.method,
            endpoint: request.endpoint,
            status: request.status,
            device: request.device,
            source: request.source,
            bytes: request.bytes,
            'Ai-decision': request.ai_decision, // Dashboard expects this format
            response_time: request.response_time
        }));

        res.status(200).json({
            status: 'success',
            results: formattedLogs.length,
            data: formattedLogs
        });

    } catch (err) {
        console.error('❌ Error fetching logs from SQLite:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve logs from database'
        });
    }
});

// GET /api/v1/logs/stats - Get statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = getRequestStats();

        res.status(200).json({
            status: 'success',
            data: stats
        });

    } catch (err) {
        console.error('❌ Error fetching stats:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve statistics'
        });
    }
});

module.exports = router;

