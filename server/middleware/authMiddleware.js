const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const isTeacher = (req, res, next) => {
    if (req.user && req.user.role === 'TEACHER') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Teachers only' });
    }
};

const isBatch = (req, res, next) => {
    if (req.user && req.user.role === 'BATCH') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Batches only' });
    }
};

module.exports = { verifyToken, isTeacher, isBatch };
