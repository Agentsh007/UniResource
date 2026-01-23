const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

router.post('/', verifyToken, isTeacher, batchController.createBatch);
router.get('/', verifyToken, isTeacher, batchController.getMyBatches);

module.exports = router;
