const jwt = require('jsonwebtoken');
require('dotenv').config();

const validateToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const now = Date.now().valueOf() / 1000;
        
        if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
            throw new Error('Token expired');
        }
        
        return decoded;
    } catch (err) {
        throw err;
    }
};

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ 
            success: false,
            msg: 'No token, authorization denied' 
        });
    }

    try {
        const decoded = validateToken(token);
        req.user = decoded.user;
        next();
    } catch (err) {
        if (err.message === 'Token expired') {
            return res.status(401).json({ 
                success: false,
                msg: 'Token has expired. Please login again' 
            });
        }
        res.status(401).json({ 
            success: false,
            msg: 'Token is not valid',
            error: err.message 
        });
    }
};