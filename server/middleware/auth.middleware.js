import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

        if (!token) {
            // Optional auth - allow guests with guest id header or generate demo session
            const guestEmail = req.headers['x-guest-email'];
            if (guestEmail) {
                let user = await User.findOne({ email: guestEmail });
                if (!user) {
                    user = await User.create({
                        name: 'Guest User',
                        email: guestEmail,
                        credits: 100
                    });
                }
                req.user = user;
                return next();
            }
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_interviewai_jwt_token_key_2025');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
