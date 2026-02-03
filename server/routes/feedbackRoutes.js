const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');

// @route   POST api/feedback
// @desc    Send feedback
// @access  Batch Only
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'BATCH') {
        return res.status(403).json({ msg: 'Access denied: Batches only' });
    }

    try {
        const newFeedback = new Feedback({
            message_content: req.body.message_content,
            is_anonymous: req.body.is_anonymous || false,
            from_batch: req.user.id
        });

        const feedback = await newFeedback.save();
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/feedback
// @desc    Get all feedback
// @access  Coordinator Only
router.get('/', auth, async (req, res) => {
    try {
        // If user is BATCH, only return their own feedback
        let query = {};
        if (req.user.role === 'BATCH') {
            query = { from_batch: req.user.id };
        } else if (req.user.role !== 'COORDINATOR' && req.user.role !== 'CHAIRMAN') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const feedback = await Feedback.find(query)
            .populate('from_batch', 'batch_name')
            .sort({ sent_at: -1 });
        res.json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE api/feedback/:id
// @desc    Delete feedback
// @access  Coordinator Only
router.delete('/:id', auth, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });

        // Check permissions
        // 1. Coordinator or Chairman can delete any
        // 2. Batch can delete their own
        if (req.user.role === 'COORDINATOR' || req.user.role === 'CHAIRMAN') {
            // Authorized
        } else if (req.user.role === 'BATCH' && feedback.from_batch.toString() === req.user.id) {
            // Authorized
        } else {
            return res.status(403).json({ msg: 'Access denied' });
        }

        await feedback.deleteOne();
        res.json({ msg: 'Feedback deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
