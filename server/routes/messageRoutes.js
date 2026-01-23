const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

// Get Directory (All teachers)
router.get('/teachers', verifyToken, isTeacher, messageController.getTeachers);

// Send Message
router.post('/', verifyToken, isTeacher, messageController.sendMessage);

// Get Conversation
router.get('/:teacherId', verifyToken, isTeacher, messageController.getConversation);

module.exports = router;
