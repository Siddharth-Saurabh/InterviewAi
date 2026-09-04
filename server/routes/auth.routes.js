import express from 'express';
import { syncUser, getProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/sync', syncUser);
router.get('/profile', protect, getProfile);

export default router;
