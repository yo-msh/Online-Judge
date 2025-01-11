const jwt = require('jsonwebtoken');

const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        try {
            const decoded = jwt.verify(token, 'your_secret_key');
            req.user = decoded;

            // Check for the required role
            if (decoded.role !== requiredRole) {
                return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    };
};

module.exports = roleMiddleware;
