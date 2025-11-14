const express = require('express');
const router = express.Router();
const { getAdminDashboardData } = require('../Controller/dashboardController');

// Dashboard ka route
router.get('/admin', getAdminDashboardData);

module.exports = router;