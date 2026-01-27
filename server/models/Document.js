const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    file_path: { type: String, required: true }, // URL
    cloudinary_id: { type: String }, // Cloudinary Public ID
    original_filename: { type: String, required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target_batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    upload_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
