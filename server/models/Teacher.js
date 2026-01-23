const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    department: { type: String },
    avatar: { type: String }, // For networking directory
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', TeacherSchema);
