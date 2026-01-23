const Batch = require('../models/Batch');
const Resource = require('../models/Resource');
const Message = require('../models/Message');

exports.getDashboardStats = async (req, res) => {
    try {
        const batchCount = await Batch.countDocuments({ createdBy: req.user.id });
        const resourceCount = await Resource.countDocuments({ uploadedBy: req.user.id });
        const unreadCount = await Message.countDocuments({ recipient: req.user.id, isRead: false });

        res.json({
            batches: batchCount,
            resources: resourceCount,
            unreadMessages: unreadCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
