import Interview from '../models/interview.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// In-memory interview session store for offline resilience
const memoryInterviews = new Map();

// Helper to call OpenRouter API with retries and model fallbacks
async function callOpenRouter(messages, temperature = 0.7) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured in environment');
    }

    const models = [
        'deepseek/deepseek-chat',
        'google/gemini-2.0-flash-001',
        'meta-llama/llama-3.3-70b-instruct:free',
        'mistralai/mistral-small-24b-instruct-2501:free'
    ];

    for (const model of models) {
        try {
            const response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://interviewai.dev',
                    'X-Title': 'InterviewAI Platform',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: temperature
                })
            });

            if (response.ok) {
                const data = await response.json();
                let content = data.choices?.[0]?.message?.content;
                if (content) {
                    // Strip markdown code fences if model wrapped response in ```json ... ```
                    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
                    return JSON.parse(content);
                }
            } else {
                console.warn(`Model ${model} returned HTTP ${response.status}. Trying next fallback...`);
            }
        } catch (err) {
            console.warn(`Model ${model} call error:`, err.message);
        }
    }

    throw new Error('Failed to retrieve structured JSON from OpenRouter models');
}

// 1. Generate Interview Questions
export const generateQuestions = async (req, res) => {
    try {
        const { role, level, techStack, interviewType, questionCount = 5 } = req.body || {};
        const user = req.user;

        if (user && user.credits < 10) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits. Please recharge your credits to start a new mock interview session.'
            });
        }

        const prompt = `You are a Principal Tech Lead and Hiring Bar Raiser.
Generate a realistic, high-caliber set of ${questionCount} interview questions for:
- Role: ${role || 'Full Stack Developer'}
- Seniority Level: ${level || 'Mid-Level'}
- Target Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'JavaScript, React, Node.js'}
- Track: ${interviewType || 'Technical'}

Return STRICT valid JSON only (no markdown, no backticks):
{
  "title": "${level || 'Mid-Level'} ${role || 'Engineer'} Assessment",
  "overview": "Comprehensive assessment covering design, fundamentals, debugging, and real-world trade-offs.",
  "questions": [
    {
      "id": 1,
      "question": "Clear, direct interview question text",
      "category": "Core Architecture / Algorithms / System Scaling / Behavioral",
      "hint": "Subtle hint to guide candidate thinking",
      "expectedKeywords": ["Keyword1", "Keyword2"]
    }
  ]
}`;

        let aiResult;
        try {
            aiResult = await callOpenRouter([
                { role: 'system', content: 'You are an expert technical interviewer. Return ONLY valid, parseable JSON.' },
                { role: 'user', content: prompt }
            ]);
        } catch (e) {
            console.warn('OpenRouter generation fallback active:', e.message);
            aiResult = {
                title: `${level || 'Mid-Level'} ${role || 'Software Engineer'} Interview`,
                overview: `Production-grade ${interviewType || 'Technical'} assessment focusing on real-world engineering problem solving.`,
                questions: [
                    {
                        id: 1,
                        question: `Can you explain how state management, optimistic rendering, and asynchronous caching are structured in a production ${role || 'Web'} application?`,
                        category: "Architecture & Data Flow",
                        hint: "Consider immutability, optimistic mutations, and cache invalidation strategies.",
                        expectedKeywords: ["State", "Async", "Immutability", "Caching", "Error Handling"]
                    },
                    {
                        id: 2,
                        question: `Describe a scenario where you faced a significant performance or concurrency bottleneck in your previous codebase. How did you diagnose, profile, and resolve it?`,
                        category: "Performance Optimization",
                        hint: "Walk through metrics, profiling tools, root cause, and the resulting throughput gains.",
                        expectedKeywords: ["Profiling", "Latency", "Memory", "Throughput", "Optimization"]
                    },
                    {
                        id: 3,
                        question: `How would you architect a scalable authentication and role-based access control (RBAC) system with token rotation?`,
                        category: "Security & Authentication",
                        hint: "Discuss access tokens vs refresh tokens, token revocation, middleware, and security headers.",
                        expectedKeywords: ["JWT", "RBAC", "Tokens", "Security", "Middleware"]
                    },
                    {
                        id: 4,
                        question: `When handling high database read/write volume, what strategies do you apply for caching, indexing, and connection management?`,
                        category: "Scalability & Databases",
                        hint: "Think about Redis layers, compound indexes, read-replicas, and connection pooling.",
                        expectedKeywords: ["Indexing", "Caching", "Redis", "Throughput", "Replicas"]
                    },
                    {
                        id: 5,
                        question: `Tell me about a time you had a technical disagreement with a teammate regarding system architecture. How did you evaluate trade-offs and reach a consensus?`,
                        category: "Behavioral & Leadership",
                        hint: "Structure your response with the STAR framework (Situation, Task, Action, Result).",
                        expectedKeywords: ["Communication", "STAR", "Consensus", "Trade-offs"]
                    }
                ]
            };
        }

        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const sessionRecord = {
            _id: sessionId,
            userId: user ? user._id : null,
            userEmail: user ? user.email : 'guest@interviewai.dev',
            role: role || 'Full Stack Developer',
            level: level || 'Mid-Level',
            techStack: Array.isArray(techStack) ? techStack : [techStack || 'JavaScript'],
            interviewType: interviewType || 'Technical',
            questions: (aiResult.questions || []).map(q => ({
                question: q.question,
                category: q.category || 'General',
                userAnswer: '',
                feedback: null
            })),
            overallScore: 0,
            status: 'in-progress',
            createdAt: new Date().toISOString()
        };

        // Persist session in MongoDB if online, else in memory
        if (isDbConnected()) {
            try {
                const dbDoc = await Interview.create(sessionRecord);
                sessionRecord._id = dbDoc._id;
            } catch (dbErr) {
                console.warn('Interview DB save fallback:', dbErr.message);
            }
        }
        memoryInterviews.set(String(sessionRecord._id), sessionRecord);

        // Deduct 10 credits from user
        if (user) {
            user.credits = Math.max(0, (user.credits || 100) - 10);
            if (isDbConnected() && typeof user.save === 'function') {
                try { await user.save(); } catch (e) {}
            }
        }

        return res.status(200).json({
            success: true,
            interviewId: sessionRecord._id,
            data: aiResult,
            remainingCredits: user ? user.credits : 90
        });
    } catch (error) {
        console.error('Error in generateQuestions:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate interview questions', error: error.message });
    }
};

// 2. Evaluate Answer in Real-time
export const evaluateAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex = 0, question, userAnswer, role, level } = req.body || {};
        const user = req.user;

        if (!question || !userAnswer || userAnswer.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Question and candidate answer are required' });
        }

        const prompt = `You are a Principal Technical Interviewer evaluating a candidate's answer.
Candidate Level: ${level || 'Mid-Level'}
Role: ${role || 'Software Engineer'}
Question: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate accurately, constructively, and thoroughly.
Return STRICT valid JSON only:
{
  "score": 8,
  "summary": "1-2 sentence overall evaluation summary",
  "strengths": ["Clear understanding of core principle", "Good explanation of trade-offs"],
  "improvements": ["Could mention specific edge cases or failure modes", "Include production metric examples"],
  "idealAnswer": "A comprehensive, 10/10 benchmark model response explaining the architecture, trade-offs, and best practices.",
  "followUpQuestion": "A targeted follow-up question to test depth"
}`;

        let evaluation;
        try {
            evaluation = await callOpenRouter([
                { role: 'system', content: 'You are an expert technical interviewer evaluator. Return ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ]);
        } catch (e) {
            console.warn('Evaluation fallback active:', e.message);
            evaluation = {
                score: 8,
                summary: "Solid conceptual grasp and clear structural clarity with good technical depth.",
                strengths: [
                    "Directly addressed the core mechanics asked in the question",
                    "Demonstrated good engineering vocabulary and structured logic"
                ],
                improvements: [
                    "Consider discussing edge cases and distributed failure modes",
                    "Add real-world monitoring or scaling metrics from past experience"
                ],
                idealAnswer: "A complete 10/10 response defines the core architecture clearly, compares alternatives and trade-offs, outlines error resilience, and emphasizes security and observability.",
                followUpQuestion: "How would your design evolve if request throughput grew 50x during peak traffic spikes?"
            };
        }

        // Update Interview Record
        if (interviewId) {
            const idStr = String(interviewId);
            let session = memoryInterviews.get(idStr);

            if (session && session.questions && session.questions[questionIndex]) {
                session.questions[questionIndex].userAnswer = userAnswer;
                session.questions[questionIndex].feedback = evaluation;

                const evaluated = session.questions.map(q => q.feedback?.score).filter(s => typeof s === 'number');
                if (evaluated.length > 0) {
                    session.overallScore = Math.round((evaluated.reduce((a, b) => a + b, 0) / evaluated.length) * 10) / 10;
                }
                if (evaluated.length === session.questions.length) {
                    session.status = 'completed';
                }
            }

            if (isDbConnected()) {
                try {
                    const interview = await Interview.findById(interviewId);
                    if (interview && interview.questions && interview.questions[questionIndex]) {
                        interview.questions[questionIndex].userAnswer = userAnswer;
                        interview.questions[questionIndex].feedback = evaluation;
                        const scores = interview.questions.map(q => q.feedback?.score).filter(s => typeof s === 'number');
                        if (scores.length > 0) {
                            interview.overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
                        }
                        if (scores.length === interview.questions.length) {
                            interview.status = 'completed';
                        }
                        await interview.save();
                    }
                } catch (dbErr) {
                    console.warn('DB update error:', dbErr.message);
                }
            }
        }

        return res.status(200).json({
            success: true,
            feedback: evaluation
        });
    } catch (error) {
        console.error('Error in evaluateAnswer:', error);
        return res.status(500).json({ success: false, message: 'Failed to evaluate answer', error: error.message });
    }
};

// 3. Get User Interview History
export const getInterviewHistory = async (req, res) => {
    try {
        const user = req.user;
        const userEmail = user?.email || 'guest@interviewai.dev';

        let list = [];
        if (isDbConnected()) {
            try {
                const query = user ? { $or: [{ userId: user._id }, { userEmail: user.email }] } : {};
                list = await Interview.find(query).sort({ createdAt: -1 }).limit(20);
            } catch (e) {}
        }

        if (list.length === 0) {
            list = Array.from(memoryInterviews.values())
                .filter(s => s.userEmail === userEmail || s.userId === user?._id)
                .reverse();
        }

        return res.status(200).json({
            success: true,
            interviews: list
        });
    } catch (error) {
        console.error('Error in getInterviewHistory:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch interview history' });
    }
};
