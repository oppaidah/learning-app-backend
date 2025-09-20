const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription_controller');
const authMiddleware = require('../middleware/auth');

// Public route to see all subscription plans
router.get('/subscription-plans', subscriptionController.getSubscriptionPlans);
router.post('/subscribe', authMiddleware, subscriptionController.updateSubscription);


module.exports = router;

