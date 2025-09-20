const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// The middleware ensures only a logged-in user can update their own profile
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;