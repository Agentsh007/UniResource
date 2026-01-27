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
    if (req.user.role !== 'COORDINATOR') {
        return res.status(403).json({ msg: 'Access denied: Coordinators only' });
    }

    try {
        const feedback = await Feedback.find()
            .populate('from_batch', 'batch_name')
            .sort({ sent_at: -1 });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE api/feedback/:id
// @desc    Delete feedback
// @access  Coordinator Only
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'COORDINATOR') {
        return res.status(403).json({ msg: 'Access denied: Coordinators only' });
    }

    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });

        await feedback.deleteOne();
        res.json({ msg: 'Feedback deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
