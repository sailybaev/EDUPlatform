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

// Change password
router.post('/user/change-password', auth, dashboardController.changePassword);

// Ticket routes
router.post('/tickets', auth, dashboardController.createTicket);
router.get('/tickets', auth, dashboardController.getUserTickets);
router.get('/tickets/:id', auth, dashboardController.getTicketDetails);
router.post('/tickets/:id/respond', auth, dashboardController.respondToTicket);

module.exports = router;