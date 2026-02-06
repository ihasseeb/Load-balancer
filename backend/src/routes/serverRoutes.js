const express = require('express');
const router = express.Router();

// Server status endpoint - Dashboard ko servers ki list aur unki status dikhata hai
router.get('/servers/status', (req, res) => {
    // Yahan aap apne actual servers ki information provide kar sakte hain
    // Abhi ke liye example data hai
    const servers = [
        {
            id: 'server-1',
            name: 'Primary Server',
            status: 'active',
            load: Math.floor(Math.random() * 50) + 20, // 20-70% load
            responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
            requests: global.totalRequests || 0,
            uptime: '99.9%',
            location: 'US-East',
            ip: '192.168.1.1'
        },
        {
            id: 'server-2',
            name: 'Secondary Server',
            status: 'active',
            load: Math.floor(Math.random() * 50) + 10, // 10-60% load
            responseTime: Math.floor(Math.random() * 100) + 40, // 40-140ms
            requests: Math.floor((global.totalRequests || 0) * 0.7),
            uptime: '99.8%',
            location: 'US-West',
            ip: '192.168.1.2'
        },
        {
            id: 'server-3',
            name: 'Backup Server',
            status: 'standby',
            load: Math.floor(Math.random() * 20), // 0-20% load
            responseTime: Math.floor(Math.random() * 80) + 30, // 30-110ms
            requests: Math.floor((global.totalRequests || 0) * 0.3),
            uptime: '99.7%',
            location: 'EU-Central',
            ip: '192.168.1.3'
        }
    ];

    res.status(200).json({
        status: 'success',
        totalServers: servers.length,
        activeServers: servers.filter(s => s.status === 'active').length,
        servers: servers,
        timestamp: new Date().toISOString()
    });
});

// Individual server status
router.get('/servers/:serverId', (req, res) => {
    const { serverId } = req.params;

    // Example server data
    const server = {
        id: serverId,
        name: `Server ${serverId}`,
        status: 'active',
        load: Math.floor(Math.random() * 100),
        responseTime: Math.floor(Math.random() * 200),
        requests: global.totalRequests || 0,
        uptime: '99.9%',
        metrics: {
            cpu: Math.floor(Math.random() * 100),
            memory: Math.floor(Math.random() * 100),
            disk: Math.floor(Math.random() * 100),
            network: Math.floor(Math.random() * 1000)
        }
    };

    res.status(200).json({
        status: 'success',
        server: server,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
