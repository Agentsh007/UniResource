const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    message_content: {
        type: String,
        required: true
    },
    is_anonymous: {
        type: Boolean,
        default: false
    },
    from_batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    target_announcement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Announcement'
    },
    sent_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
