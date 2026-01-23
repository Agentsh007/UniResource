const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware.verifyToken, authMiddleware.isTeacher, teacherController.getDashboardStats);

module.exports = router;
