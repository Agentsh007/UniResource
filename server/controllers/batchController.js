const Batch = require('../models/Batch');
const bcrypt = require('bcrypt');

// Create Batch
exports.createBatch = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        let batch = await Batch.findOne({ username });
        if (batch) return res.status(400).json({ msg: 'Batch username already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        batch = new Batch({
            name,
            username,
            password: hashedPassword,
            createdBy: req.user.id
        });

        await batch.save();
        res.json(batch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Batches by Teacher
exports.getMyBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
