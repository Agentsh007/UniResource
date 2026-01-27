const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');

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
router.post('/', auth, async (req, res) => {
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
        const newAnnouncement = new Announcement({
            title,
            content,
            author: req.user.id,
            target_batch: target_batch || null, // Null for global notices
            type
        });

        const saved = await newAnnouncement.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
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
            // Staff see all for now, or maybe filtrable.
            // Let's allow staff to see everything they authored OR all global notices.
            // Simplified: Staff sees everything to monitor.
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

        await announcement.deleteOne();
        res.json({ msg: 'Deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
