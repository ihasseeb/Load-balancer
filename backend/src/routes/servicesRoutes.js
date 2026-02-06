const express = require('express');
const router = express.Router();
const http = require('http');
const net = require('net');
const { spawn, exec } = require('child_process');
const path = require('path');

// Helper function to check if a service is running on a port
const checkServiceHealth = (host, port) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 2000; // 2 seconds timeout

        socket.setTimeout(timeout);
        socket.on('connect', () => {
            socket.destroy();
            resolve({ status: 'running', responseTime: Date.now() - startTime });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ status: 'timeout', responseTime: null });
        });

        socket.on('error', () => {
            resolve({ status: 'stopped', responseTime: null });
        });

        const startTime = Date.now();
        socket.connect(port, host);
    });
};

// Helper function to get Prometheus metrics
const getPrometheusMetrics = async () => {
    return new Promise((resolve) => {
        http.get('http://localhost:9090/api/v1/query?query=up', (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ available: true, data: parsed });
                } catch (e) {
                    resolve({ available: false, data: null });
                }
            });
        }).on('error', () => {
            resolve({ available: false, data: null });
        });
    });
};

// Get all services status
router.get('/services/status', async (req, res) => {
    try {
        // Define all services (matching actual setup)
        const services = [
            { id: 'backend-api', name: 'Backend API', type: 'api', host: 'localhost', port: 8000, description: 'Main backend API server', icon: '🚀' },
            { id: 'dashboard', name: 'Dashboard', type: 'application', host: 'localhost', port: 3000, description: 'React monitoring dashboard', icon: '📊' },
            { id: 'prometheus', name: 'Prometheus', type: 'monitoring', host: 'localhost', port: 9090, description: 'Metrics collection and monitoring', icon: '📈' },
            { id: 'loki', name: 'Loki', type: 'logging', host: 'localhost', port: 3100, description: 'Log aggregation system', icon: '📝' },
            { id: 'redis', name: 'Redis', type: 'cache', host: 'localhost', port: 6379, description: 'In-memory cache and rate limiting', icon: '⚡' },
            { id: 'nginx', name: 'NGINX', type: 'proxy', host: 'localhost', port: 80, description: 'Reverse proxy and load balancer', icon: '🌐' }
        ];

        // Check health of all services with advanced metadata
        const statusChecks = await Promise.all(
            services.map(async (service) => {
                const health = await checkServiceHealth(service.host, service.port);
                let metadata = {};

                // 2. Advanced HTTP Check (Only if running and is an HTTP service)
                if (health.status === 'running' && ['monitoring', 'logging', 'visualization', 'api', 'application'].includes(service.type)) {
                    try {
                        let url = '';
                        if (service.id === 'prometheus') url = `http://${service.host}:${service.port}/-/healthy`;
                        else if (service.id === 'loki') url = `http://${service.host}:${service.port}/ready`;
                        else if (service.id === 'backend-api') url = `http://${service.host}:${service.port}/api/v1/health`;
                        else if (service.id === 'dashboard') {
                            // Dashboard is a React app, just check if port is responding (already done above)
                            metadata.httpStatus = "Running";
                            metadata.statusCode = 200;
                        }

                        if (url) {
                            const httpCheck = await new Promise((resolve) => {
                                http.get(url, (res) => {
                                    resolve({ code: res.statusCode, active: res.statusCode >= 200 && res.statusCode < 400 });
                                }).on('error', () => resolve({ code: null, active: false }));
                            });

                            if (httpCheck.active) {
                                metadata.httpStatus = "Healthy";
                                metadata.statusCode = httpCheck.code;
                            }
                        }
                    } catch (err) { }
                }

                return {
                    ...service,
                    status: health.status,
                    responseTime: health.responseTime,
                    uptime: health.status === 'running' ? 'Active' : 'Down',
                    lastChecked: new Date().toISOString(),
                    ...metadata
                };
            })
        );

        // Get Prometheus metrics if available
        const prometheusMetrics = await getPrometheusMetrics();

        // Calculate summary
        const summary = {
            total: services.length,
            running: statusChecks.filter(s => s.status === 'running').length,
            stopped: statusChecks.filter(s => s.status === 'stopped').length,
            timeout: statusChecks.filter(s => s.status === 'timeout').length
        };

        res.status(200).json({
            status: 'success', summary, services: statusChecks, prometheus: prometheusMetrics, timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message, timestamp: new Date().toISOString() });
    }
});

// Get individual service status (Keeping simplified for brevity, logic mostly same as getAll)
router.get('/services/:serviceId', async (req, res) => {
    // ... (Use checkServiceHealth logic if needed for single service) 
    // For now returning basic success to avoid breaking frontend calls
    res.status(200).json({ status: 'success', message: 'Use /services/status for full data' });
});

// Store running processes in memory
const runningProcesses = {};

// Start/Stop service commands
router.post('/services/:serviceId/action', async (req, res) => {
    const { serviceId } = req.params;

    console.log('🔧 Service action request received:');
    console.log('  - Service ID:', serviceId);
    console.log('  - Headers:', req.headers);
    console.log('  - Body:', req.body);
    console.log('  - Body type:', typeof req.body);

    // Validate request body
    if (!req.body || !req.body.action) {
        console.error('❌ Missing action in request body');
        return res.status(400).json({
            status: 'error',
            message: 'Missing action in request body. Expected: { "action": "start" | "stop" }'
        });
    }

    const { action } = req.body;
    console.log('✅ Action extracted:', action);

    const binDir = path.join(__dirname, '../bin');

    // Commands map to local binaries
    const commands = {
        prometheus: {
            cmd: path.join(binDir, 'prometheus.exe'),
            args: ['--config.file=prometheus-config.yml']
        },
        redis: {
            cmd: path.join(binDir, 'redis-server.exe'),
            args: []
        },
        nginx: {
            cmd: path.join(binDir, 'nginx.exe'),
            args: []
        },
        loki: {
            cmd: path.join(binDir, 'loki-windows-amd64.exe'),
            args: ['--config.file=loki-config.yml']
        },
        grafana: {
            // Grafana in specific version folder
            cmd: path.join(binDir, 'grafana-10.0.1', 'bin', 'grafana-server.exe'),
            args: []
        },
        'natours-app': { cmd: 'npm', args: ['start'], cwd: process.cwd() }
    };

    if (action === 'start') {
        if (!commands[serviceId]) {
            return res.status(400).json({ status: 'error', message: 'Service command not configured' });
        }
        const config = commands[serviceId];
        try {
            const child = spawn(config.cmd, config.args || [], {
                cwd: config.cwd || process.cwd(),
                shell: true,
                detached: false,
                stdio: 'ignore'
            });
            runningProcesses[serviceId] = child;
            console.log(`Started ${serviceId} with PID: ${child.pid}`);
            return res.status(200).json({ status: 'success', message: `${serviceId} started successfully`, pid: child.pid });
        } catch (err) {
            return res.status(500).json({ status: 'error', message: `Failed to start: ${err.message}` });
        }
    }
    else if (action === 'stop') {
        const child = runningProcesses[serviceId];
        let commandPath = commands[serviceId]?.cmd;

        try {
            if (child) {
                child.kill();
                delete runningProcesses[serviceId];
            }
            if (commandPath && commandPath.includes('.exe')) {
                const exeName = path.basename(commandPath);
                exec(`taskkill /F /IM ${exeName}`, (err) => { });
            }
            return res.status(200).json({ status: 'success', message: `${serviceId} stop command sent` });
        } catch (err) {
            return res.status(500).json({ status: 'error', message: `Failed to stop: ${err.message}` });
        }
    }
    res.status(400).json({ status: 'error', message: 'Invalid action' });
});

module.exports = router;
