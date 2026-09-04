import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_interviewai_jwt_token_key_2025', {
        expiresIn: '30d'
    });
};

export const syncUser = async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                credits: 100 // Welcome credits
            });
        } else if (name && user.name !== name) {
            user.name = name;
            await user.save();
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits
            },
            token
        });
    } catch (error) {
        console.error('Error in syncUser:', error);
        res.status(500).json({ success: false, message: 'Server error syncing user', error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                credits: user.credits
            }
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving profile' });
    }
};
