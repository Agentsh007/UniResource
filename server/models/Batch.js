const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "CSE-2024"
    username: { type: String, required: true, unique: true }, // Login ID
    password: { type: String, required: true }, // bcrypt hashed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);
