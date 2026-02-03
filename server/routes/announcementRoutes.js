const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');
const multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb('Error: Images, PDFs and Docs Only!');
        }
    }
});

// @route   GET api/announcements/public
// @desc    Get all public notices (for Home Page)
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const notices = await Announcement.find({ type: 'NOTICE' })
            .populate('author', 'full_name role')
            .sort({ created_at: -1 })
            .limit(10); // Limit to latest 10
        res.json(notices);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/announcements
// @desc    Create a notice or announcement
// @access  Chairman, Operator, CC, Teacher
router.post('/', auth, upload.single('file'), async (req, res) => {
    const { title, content, target_batch, type } = req.body;
    const { role } = req.user;

    // Permission Check
    if (type === 'NOTICE') {
        if (!['CHAIRMAN', 'COMPUTER_OPERATOR'].includes(role)) {
            return res.status(403).json({ msg: 'Only Chairman or Operator can post Notices' });
        }
    } else if (type === 'ANNOUNCEMENT') {
        if (!['CC', 'TEACHER'].includes(role)) {
            return res.status(403).json({ msg: 'Only CC or Teacher can post Announcements' });
        }
        if (!target_batch) {
            return res.status(400).json({ msg: 'Announcements must have a target batch' });
        }
    } else {
        return res.status(400).json({ msg: 'Invalid Type' });
    }

    try {
        let file_url = null;

        if (req.file) {
            // Upload to Cloudinary
            const path = require('path');
            const fileExt = path.extname(req.file.originalname);
            const cleanFileName = req.file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
            const isImage = req.file.mimetype.startsWith('image/');
            const resourceType = isImage ? 'image' : 'raw';

            // For raw files, we MUST append extension to public_id to preserve it in URL
            const fullPublicId = `uni_connect_notices/${cleanFileName}_${Date.now()}`;

            // Revert towards standard stream - but use 'auto' or 'image' for PDFs. 
            // 'raw' for PDF often causes "Failed to load" if not handled perfectly.
            // Cloudinary recommends 'image' for PDFs to generate thumbnails and view them.

            // Allow Cloudinary to detect. For PDF, it becomes 'image' usually.
            // But we want to ensure it works.

            // Data URI Upload with FORCED RAW for Documents
            // This ensures PDFs are not converted to images (which causes "Failed to Load")
            // (Variables isImage and resourceType already defined above)

            // Append extension for raw files so URL is correct (e.g. file.pdf)
            let finalPublicId = fullPublicId;
            if (resourceType === 'raw') {
                finalPublicId += fileExt;
            }

            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

            console.log(`[Upload] Starting: ${req.file.originalname}, Type: ${resourceType}, ID: ${finalPublicId}`);

            const result = await cloudinary.uploader.upload(dataURI, {
                public_id: finalPublicId,
                resource_type: resourceType
            });

            console.log('[Upload] Success. URL:', result.secure_url);
            file_url = result.secure_url;

            const newAnnouncement = new Announcement({
                title,
                content,
                author: req.user.id,
                target_batch: target_batch || null,
                type,
                file_url
            });

            const saved = await newAnnouncement.save();
            res.json(saved);

        } else {
            const newAnnouncement = new Announcement({
                title,
                content,
                author: req.user.id,
                target_batch: target_batch || null, // Null for global notices
                type
            });

            const saved = await newAnnouncement.save();
            res.json(saved);
        }

    } catch (err) {
        console.error('Upload Error:', err);
        if (!res.headersSent) res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

// @route   GET api/announcements
// @desc    Get announcements relevant to the user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        const { role, id } = req.user;

        if (role === 'BATCH') {
            // Batches see Global Notices AND Announcements for their batch
            query = {
                $or: [
                    { type: 'NOTICE' }, // Global
                    { target_batch: id } // Specific to this batch
                ]
            };
        } else {
            // Staff see all for now, to allow Ops to verify deletion
            query = {};
        }

        const announcements = await Announcement.find(query)
            .populate('author', 'full_name role')
            .populate('target_batch', 'batch_name')
            .sort({ created_at: -1 });

        res.json(announcements);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE api/announcements/:id
// @desc    Delete an announcement
// @access  Author or Chairman
router.delete('/:id', auth, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ msg: 'Not Found' });

        // Check ownership
        if (announcement.author.toString() !== req.user.id && req.user.role !== 'CHAIRMAN') {
            return res.status(401).json({ msg: 'Not Authorized' });
        }

        await Announcement.deleteOne({ _id: req.params.id });
        console.log(`[Delete] Announcement ${req.params.id} deleted by ${req.user.id}`);
        res.json({ msg: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
});

module.exports = router;
