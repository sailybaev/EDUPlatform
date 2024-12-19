const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardStudentController');

// Get user profile
router.get('/user/profile', auth, dashboardController.getUserProfile);

// Get reading progress
router.get('/reading/progress', auth, dashboardController.getReadingProgress);

// Get upcoming tasks
router.get('/tasks/upcoming', auth, dashboardController.getUpcomingTasks);

// Get perfomance
router.get('/exams/performance', auth, dashboardController.getExamPerformance);
module.exports = router;