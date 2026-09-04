import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// In-memory mock store if DB is offline
const memoryUsers = new Map();

// Initialize permanent dummy user in memory
const DUMMY_USER_ID = '673a11111111111111111111';
const DUMMY_EMAIL = 'demo@interviewai.dev';
const DUMMY_HASH = crypto.createHash('sha256').update('Password123!').digest('hex');

memoryUsers.set(DUMMY_EMAIL, {
    _id: DUMMY_USER_ID,
    name: 'Siddharth Demo User',
    email: DUMMY_EMAIL,
    password: DUMMY_HASH,
    credits: 250
});

const hashPassword = (pwd) => {
    return crypto.createHash('sha256').update(pwd).digest('hex');
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_interviewai_jwt_token_key_2025', {
        expiresIn: '30d'
    });
};

// Auto seed default permanent dummy account in MongoDB if connected
export const seedDummyUser = async () => {
    try {
        let user = await User.findOne({ email: DUMMY_EMAIL });
        if (!user) {
            user = await User.create({
                name: 'Siddharth Demo User',
                email: DUMMY_EMAIL,
                password: DUMMY_HASH,
                credits: 250
            });
            console.log('Seeded permanent dummy user into MongoDB: demo@interviewai.dev / Password123!');
        }
    } catch (e) {
        console.log('Using in-memory user store for dummy account (demo@interviewai.dev / Password123!)');
    }
};

// 1. Password Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        let user = null;
        try {
            user = await User.findOne({ email });
        } catch (dbErr) {
            user = memoryUsers.get(email);
        }

        if (!user && memoryUsers.has(email)) {
            user = memoryUsers.get(email);
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const hashedPassword = hashPassword(password);
        if (user.password && user.password !== hashedPassword && user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id || user.id || DUMMY_USER_ID);

        res.status(200).json({
            success: true,
            user: {
                id: user._id || user.id || DUMMY_USER_ID,
                name: user.name,
                email: user.email,
                credits: user.credits || 100
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

        let user = null;
        try {
            user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ success: false, message: 'User with this email already exists' });
            }

            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: hashPassword(password),
                credits: 100
            });
        } catch (dbErr) {
            if (memoryUsers.has(email)) {
                return res.status(400).json({ success: false, message: 'User with this email already exists' });
            }
            const newId = `user_${Date.now()}`;
            user = {
                _id: newId,
                name: name || email.split('@')[0],
                email,
                password: hashPassword(password),
                credits: 100
            };
            memoryUsers.set(email, user);
        }

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

        let user = null;
        try {
            user = await User.findOne({ email });
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
        } catch (dbErr) {
            if (!memoryUsers.has(email)) {
                const newId = `user_${Date.now()}`;
                user = {
                    _id: newId,
                    name: name || email.split('@')[0],
                    email,
                    credits: 100
                };
                memoryUsers.set(email, user);
            } else {
                user = memoryUsers.get(email);
            }
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
        let user = null;
        try {
            user = await User.findById(req.user._id);
        } catch (e) {
            user = req.user;
        }

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
