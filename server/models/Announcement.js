const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null }, // Null = Global/Department Notice
    type: { type: String, enum: ['NOTICE', 'ANNOUNCEMENT'], required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
