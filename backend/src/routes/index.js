/**
 * Central Route Aggregator
 * Combines all API routes into a single export
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const tourRoutes = require('./tourRoutes');
const userRoutes = require('./userRoutes');
const servicesRoutes = require('./servicesRoutes');
const metricsRoutes = require('./metricsRoutes');
const logsRoutes = require('./logsRoutes');
const aiServicesRoutes = require('./aiServicesRoutes');
const serverRoutes = require('./serverRoutes');
const loadBalancerRoutes = require('./loadBalancer');

// API v1 Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/tours', tourRoutes);
router.use('/users', userRoutes);
router.use('/services', servicesRoutes);
router.use('/metrics', metricsRoutes);
router.use('/logs', logsRoutes);
router.use('/ai-services', aiServicesRoutes);
router.use('/servers', serverRoutes);
router.use('/load-balancer', loadBalancerRoutes);

module.exports = router;
