const Teacher = require('../models/Teacher');
const Batch = require('../models/Batch');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerTeacher = async (req, res) => {
    const { name, email, password, department } = req.body;
    try {
        let teacher = await Teacher.findOne({ email });
        if (teacher) return res.status(400).json({ msg: 'Teacher already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        teacher = new Teacher({ name, email, password: hashedPassword, department });
        await teacher.save();

        const payload = {
            id: teacher.id,
            role: 'TEACHER',
            name: teacher.name
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.loginTeacher = async (req, res) => {
    const { email, password } = req.body;
    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = {
            id: teacher.id,
            role: 'TEACHER',
            name: teacher.name
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.loginBatch = async (req, res) => {
    const { username, password } = req.body;
    try {
        const batch = await Batch.findOne({ username });
        if (!batch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, batch.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = {
            id: batch.id,
            role: 'BATCH',
            name: batch.name,
            username: batch.username
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateTeacherProfile = async (req, res) => {
    const { name, email, department, password } = req.body;
    try {
        let teacher = await Teacher.findById(req.user.id);
        if (!teacher) return res.status(404).json({ msg: 'User not found' });

        teacher.name = name || teacher.name;
        teacher.email = email || teacher.email;
        teacher.department = department || teacher.department;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            teacher.password = await bcrypt.hash(password, salt);
        }

        await teacher.save();

        const payload = {
            id: teacher.id,
            role: 'TEACHER',
            name: teacher.name,
            email: teacher.email,
            department: teacher.department
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
