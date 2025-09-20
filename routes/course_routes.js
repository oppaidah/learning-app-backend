const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course_controller');
const authMiddleware = require('../middleware/auth');


// Public routes
router.get('/courses', courseController.getAllCourses);
router.get('/courses/search', courseController.searchCourses);
router.get('/tags', courseController.getAllTags);
router.get('/course/:id', courseController.getCourseById);
router.get('/courses/completed', authMiddleware, courseController.getCompletedCourses);

// Protected routes (require a valid token)
router.get('/my-courses', authMiddleware, courseController.getMyCourses);
router.post('/enroll', authMiddleware, courseController.enrollInCourse);
router.post('/unenroll', authMiddleware, courseController.unenrollFromCourse);

module.exports = router;