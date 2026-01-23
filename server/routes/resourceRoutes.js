const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/upload', verifyToken, isTeacher, upload.single('file'), resourceController.uploadResource);
router.get('/feed', verifyToken, resourceController.getFeed);
router.put('/:id', verifyToken, isTeacher, resourceController.updateResource);
router.delete('/:id', verifyToken, isTeacher, resourceController.deleteResource);

module.exports = router;
