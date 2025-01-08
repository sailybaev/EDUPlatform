const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Check if registered
router.get('/isRegistered', authController.isRegistered);

// Verify 2FA
router.post('/verify2fa', authController.verify2FA);

// Verify 2FA login
router.post('/verify2fa-login', authController.verify2FALogin);

module.exports = router;