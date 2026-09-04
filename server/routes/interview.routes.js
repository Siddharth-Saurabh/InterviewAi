import express from 'express';
import { generateQuestions, evaluateAnswer, getInterviewHistory } from '../controllers/interview.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', protect, generateQuestions);
router.post('/evaluate', protect, evaluateAnswer);
router.get('/history', protect, getInterviewHistory);

export default router;
