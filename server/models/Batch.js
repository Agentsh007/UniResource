const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    batch_name: { type: String, required: true }, // e.g., "CSE-2026"
    batch_username: { type: String, required: true, unique: true },
    batch_password: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);
