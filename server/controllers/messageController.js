const Message = require('../models/Message');
const Teacher = require('../models/Teacher');

// Send Message
exports.sendMessage = async (req, res) => {
    const { recipientId, content } = req.body;
    try {
        const message = new Message({
            sender: req.user.id,
            recipient: recipientId,
            content
        });
        await message.save();
        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Conversation with a specific teacher
exports.getConversation = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, recipient: req.params.teacherId },
                { sender: req.params.teacherId, recipient: req.user.id }
            ]
        })
            .sort({ createdAt: 1 }); // Oldest first
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Teachers (Directory)
exports.getTeachers = async (req, res) => {
    try {
        // Exclude the current user from the list
        const teachers = await Teacher.find({ _id: { $ne: req.user.id } }).select('-password');
        res.json(teachers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
