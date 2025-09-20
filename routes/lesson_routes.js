const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson_controller');
const authMiddleware = require('../middleware/auth');

// This is a protected route to mark a lesson as complete
router.post('/lessons/complete', authMiddleware, lessonController.completeLesson);

module.exports = router;