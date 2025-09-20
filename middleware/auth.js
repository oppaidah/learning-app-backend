const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-super-secret-key';

module.exports = (req, res, next) => {
    try {
        // Token is expected in the format: "Bearer <token>"
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed.' });
        }
        
        // Verify the token and add its payload (userId, email) to the request object
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.userData = { userId: decodedToken.userId };
        
        next(); // Proceed to the next function (the controller)
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed.' });
    }
};