const Resource = require('../models/Resource');

// Create Resource
exports.uploadResource = async (req, res) => {
    const { title, description, type, visibility, targetBatch } = req.body;

    // Cloudinary returns the URL in req.file.path
    const fileUrl = req.file ? req.file.path : '';

    try {
        const resource = new Resource({
            title,
            description,
            type,
            fileUrl,
            visibility,
            targetBatch: visibility === 'BATCH' ? targetBatch : undefined,
            uploadedBy: req.user.id
        });

        await resource.save();
        res.json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Resource Feed
exports.getFeed = async (req, res) => {
    const { type } = req.query; // global or batch

    try {
        let resources;
        if (type === 'global') {
            resources = await Resource.find({ visibility: 'GLOBAL' })
                .populate('uploadedBy', 'name department')
                .sort({ createdAt: -1 });
        } else if (type === 'batch') {
            // Must be logged in as Batch specific or Teacher
            if (req.user.role === 'BATCH') {
                resources = await Resource.find({ targetBatch: req.user.id })
                    .populate('uploadedBy', 'name department')
                    .sort({ createdAt: -1 });
            } else if (req.user.role === 'TEACHER') {
                // Teachers might want to see what they uploaded to a batch?
                // For now, let's allow teachers to query by passing a batchId manually if needed, 
                // but for this specific 'feed' endpoint simplified for students:
                return res.json([]); // Return empty for teacher on batch feed for now or handle differently
            }
        } else {
            return res.status(400).json({ msg: 'Invalid feed type' });
        }

        res.json(resources);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateResource = async (req, res) => {
    const { title, description, visibility, targetBatch, type } = req.body;
    try {
        let resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        if (resource.uploadedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        resource.title = title || resource.title;
        resource.description = description || resource.description;
        resource.visibility = visibility || resource.visibility;
        resource.type = type || resource.type; // Allow type update? Why not.
        if (visibility === 'BATCH') {
            resource.targetBatch = targetBatch || resource.targetBatch;
        } else {
            resource.targetBatch = undefined;
        }

        await resource.save();
        res.json(resource);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        // Check ownership
        if (resource.uploadedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Optional: Delete physical file from 'uploads' folder (fs.unlink)
        // For now, just removing from DB is fine to start.

        await resource.deleteOne();
        res.json({ msg: 'Resource removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

