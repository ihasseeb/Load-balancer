// Metrics Middleware - Har request ko track karta hai
const metricsMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Initialize global counters agar pehli baar hai
    if (!global.totalRequests) global.totalRequests = 0;
    if (!global.successRequests) global.successRequests = 0;
    if (!global.failedRequests) global.failedRequests = 0;
    if (!global.activeConnections) global.activeConnections = 0;
    if (!global.totalConnections) global.totalConnections = 0;
    if (!global.responseTimes) global.responseTimes = [];

    // Request count increase
    global.totalRequests++;
    global.totalConnections++;
    global.activeConnections++;

    // Log request (optional - development ke liye useful)
    console.log(`📊 [${new Date().toISOString()}] ${req.method} ${req.path}`);

    // Response finished listener
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;

        // Success ya failed request count
        if (res.statusCode >= 200 && res.statusCode < 400) {
            global.successRequests++;
        } else {
            global.failedRequests++;
        }

        // Active connections decrease
        global.activeConnections--;

        // Response time track karein
        global.responseTimes.push(responseTime);

        // Sirf last 100 response times rakhein (memory save karne ke liye)
        if (global.responseTimes.length > 100) {
            global.responseTimes.shift();
        }

        // Calculate averages
        if (global.responseTimes.length > 0) {
            global.avgResponseTime = Math.floor(
                global.responseTimes.reduce((a, b) => a + b, 0) / global.responseTimes.length
            );
            global.minResponseTime = Math.min(...global.responseTimes);
            global.maxResponseTime = Math.max(...global.responseTimes);
        }

        // Log response (optional)
        console.log(`✅ [${res.statusCode}] ${req.method} ${req.path} - ${responseTime}ms`);
    });

    next();
};

module.exports = metricsMiddleware;
