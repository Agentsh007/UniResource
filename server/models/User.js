const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CHAIRMAN', 'COMPUTER_OPERATOR', 'CC', 'COORDINATOR', 'TEACHER'], required: true },
    department: { type: String }, // Optional for Coord, Required logic in route or frontend
    assigned_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // For CC (Teacher) or specific assignments
    account_status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
