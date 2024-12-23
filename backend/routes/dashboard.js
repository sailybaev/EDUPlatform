const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardStudentController');

// Get user profile
router.get('/user/profile', auth, dashboardController.getUserProfile);

// Get reading progress
router.get('/reading/progress', auth, dashboardController.getReadingProgress);

// Get upcoming events
router.get('/events/upcoming', auth, dashboardController.getUpcomingEvents);

// Get performance data
router.get('/performance', auth, dashboardController.getPerformanceData);


module.exports = router;