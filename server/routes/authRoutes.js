const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/teacher/register', authController.registerTeacher);
router.post('/teacher/login', authController.loginTeacher);
router.put('/teacher/profile', require('../middleware/authMiddleware').verifyToken, require('../middleware/authMiddleware').isTeacher, authController.updateTeacherProfile);
router.post('/batch/login', authController.loginBatch);

module.exports = router;
