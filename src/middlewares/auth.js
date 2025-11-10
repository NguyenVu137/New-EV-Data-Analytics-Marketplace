import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        next();
    } catch (err) {
        return res.status(401).json({ errCode: 2, message: 'Invalid token' });
    }
};
