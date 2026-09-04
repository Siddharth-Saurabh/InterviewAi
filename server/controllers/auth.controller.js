import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const hashPassword = (pwd) => {
    return crypto.createHash('sha256').update(pwd).digest('hex');
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_interviewai_jwt_token_key_2025', {
        expiresIn: '30d'
    });
};

// Auto seed default permanent dummy account
export const seedDummyUser = async () => {
    try {
        const dummyEmail = 'demo@interviewai.dev';
        let user = await User.findOne({ email: dummyEmail });
        if (!user) {
            user = await User.create({
                name: 'Siddharth Demo User',
                email: dummyEmail,
                password: hashPassword('Password123!'),
                credits: 250 // Starter bonus credits
            });
            console.log('Seeded permanent dummy user: demo@interviewai.dev / Password123!');
        }
    } catch (e) {
        console.warn('Dummy user seed check:', e.message);
    }
};

// 1. Password Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare hashed password or plain match fallback
        const hashedPassword = hashPassword(password);
        if (user.password && user.password !== hashedPassword && user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
        console.error('Error in loginUser:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// 2. Register with Password
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        user = await User.create({
            name: name || email.split('@')[0],
            email,
            password: hashPassword(password),
            credits: 100
        });

        const token = generateToken(user._id);

        res.status(201).json({
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
        console.error('Error in registerUser:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// 3. Fast Sync (Firebase / Guest)
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
                credits: 100
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

// 4. Get Profile
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
