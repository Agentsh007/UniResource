const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    message_content: { type: String, required: true },
    from_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    sent_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
