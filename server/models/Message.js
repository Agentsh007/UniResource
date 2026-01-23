const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    content: { type: String, required: true }, // Text content or file link
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
