const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['PDF', 'PPT', 'CODE', 'TEXT'], required: true },
    fileUrl: { type: String }, // Empty if type is TEXT
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    visibility: { type: String, enum: ['BATCH', 'GLOBAL'], required: true },
    targetBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // Required if visibility is 'BATCH'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);
