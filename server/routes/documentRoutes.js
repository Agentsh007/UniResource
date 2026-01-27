const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');
const Document = require('../models/Document');
const User = require('../models/User');

const { storage, cloudinary } = require('../config/cloudinary');

// Multer Config
const upload = multer({
    storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx|ppt|pptx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        // Basic check, Cloudinary handles most validation too but good to keep
        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb('Error: Images, PDFs and Docs Only!');
        }
    }
});

// @route   POST api/documents/upload
// @desc    Upload a document
// @access  Teacher Only
router.post('/upload', auth, upload.single('file'), async (req, res) => {
    if (req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Access denied: Teachers only' });
    }

    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    try {
        console.log('File uploaded to Cloudinary:', req.file);
        console.log('Body:', req.body);
        const newDoc = new Document({
            file_path: req.file.path, // Cloudinary URL
            cloudinary_id: req.file.filename, // Cloudinary Public ID
            original_filename: req.file.originalname,
            uploaded_by: req.user.id,
            target_batch: req.body.target_batch_id
        });

        const doc = await newDoc.save();
        res.json(doc);
    } catch (err) {
        console.error('Upload Route Error:', JSON.stringify(err, null, 2));
        console.error(err.stack);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE api/documents/:id
// @desc    Delete a document
// @access  Owner Teacher Only
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        // Check ownership
        if (doc.uploaded_by.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this file' });
        }

        // Remove from Cloudinary
        if (doc.cloudinary_id) {
            await cloudinary.uploader.destroy(doc.cloudinary_id);
        }

        await doc.deleteOne();
        res.json({ msg: 'Document removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/documents/batch/:batch_id/teachers
// @desc    Get all teachers who uploaded to this batch
// @access  Batch/Staff
router.get('/batch/:batch_id/teachers', auth, async (req, res) => {
    try {
        // Find documents for this batch
        const docs = await Document.find({ target_batch: req.params.batch_id });

        // Extract unique teacher IDs
        const teacherIds = [...new Set(docs.map(doc => doc.uploaded_by.toString()))];

        // Get Teacher details
        const teachers = await User.find({ _id: { $in: teacherIds } }).select('full_name _id email');

        res.json(teachers);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/documents/batch/:batch_id/teacher/:teacher_id
// @desc    Get files for specific batch & teacher
// @access  Batch/Staff
router.get('/batch/:batch_id/teacher/:teacher_id', auth, async (req, res) => {
    try {
        const docs = await Document.find({
            target_batch: req.params.batch_id,
            uploaded_by: req.params.teacher_id
        }).sort({ upload_date: -1 });

        res.json(docs);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/documents/my-uploads
// @desc    Get current teacher's uploads
// @access  Teacher
router.get('/my-uploads', auth, async (req, res) => {
    if (req.user.role !== 'TEACHER') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const docs = await Document.find({ uploaded_by: req.user.id })
            .populate('target_batch', 'batch_name')
            .sort({ upload_date: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
