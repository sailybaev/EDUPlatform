const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (req.user.who !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};

// Get all users
router.get('/users', auth, checkAdmin, adminController.getAllUsers);

// Update user info
router.put('/users/:id', auth, checkAdmin, adminController.updateUser);

// Delete user
router.delete('/users/:id', auth, checkAdmin, adminController.deleteUser);

// Create new course
router.post('/courses', auth, checkAdmin, adminController.createCourse);

// Get all courses
router.get('/courses', auth, checkAdmin, adminController.getAllCourses);

// Add to existing routes
router.delete('/courses/:id', auth , checkAdmin , adminController.deleteCourse);

router.put('/courses/:id', auth, checkAdmin, adminController.updateCourse);

// Ticket routes
router.get('/tickets', auth, checkAdmin, adminController.getAllTickets);
router.get('/tickets/:id', auth, checkAdmin, adminController.getTicketDetails);
router.put('/tickets/:id/accept', auth, checkAdmin, adminController.acceptTicket);
router.put('/tickets/:id/reject', auth, checkAdmin, adminController.rejectTicket);
router.put('/tickets/:id/complete', auth, checkAdmin, adminController.completeTicket);
router.post('/tickets/:id/respond', auth, checkAdmin, adminController.respondToTicket);

module.exports = router;
