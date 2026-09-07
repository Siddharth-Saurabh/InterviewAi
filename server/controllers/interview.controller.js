import Interview from '../models/interview.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// In-memory interview session store for offline resilience
const memoryInterviews = new Map();

// Reusable Interviewer Personalities configuration
export const INTERVIEWER_PERSONALITIES = {
    'Professional': {
        name: 'Professional',
        tone: 'formal, structured, and realistic',
        style: 'Ask direct, industry-standard interview questions. Focus on practical engineering trade-offs, structured problem solving, and production architecture.',
        evalStyle: 'Provide balanced, constructive, and actionable feedback.',
        greeting: "Hello! I'm your AI Lead Technical Interviewer today. We'll be walking through a structured technical session. Take your time, explain your thought process clearly, and let's begin."
    },
    'Friendly': {
        name: 'Friendly',
        tone: 'encouraging, warm, and supportive while maintaining high technical rigor',
        style: 'Frame questions invitingly. Encourage the candidate to walk through their reasoning step-by-step.',
        evalStyle: 'Highlight strengths warmly, gently point out edge cases and optimization opportunities.',
        greeting: "Hi there! Great to meet you. I'm your interviewer for today's session. Don't worry if a question seems challenging—just think out loud and walk me through your logic. Let's get started!"
    },
    'Technical Expert': {
        name: 'Technical Expert',
        tone: 'deeply technical, analytical, challenging vague answers, and demanding precise mechanisms',
        style: 'Dig deep into internal mechanics, memory/concurrency trade-offs, scalability bottlenecks, and failure modes.',
        evalStyle: 'Critique architectural weaknesses rigorously and demand concrete benchmark evidence.',
        greeting: "Greetings. I'm the Principal Systems Architect leading your technical deep dive. I'll be evaluating architectural precision, algorithmic complexity, and production scalability. Let's begin with our first problem."
    },
    'Strict': {
        name: 'Strict',
        tone: 'direct, concise, no-nonsense, challenging incomplete answers, and testing edge cases',
        style: 'Ask crisp, demanding questions. Challenge assumptions and probe for overlooked edge cases or race conditions.',
        evalStyle: 'Point out any lack of depth or precision directly without sugarcoating.',
        greeting: "Welcome. This is a rigorous assessment. Be concise, mathematically and architecturally accurate, and state trade-offs explicitly. Let's start immediately."
    },
    'HR Interviewer': {
        name: 'HR Interviewer',
        tone: 'focused on behavioral dynamics, communication clarity, STAR framework, conflict resolution, and culture alignment',
        style: 'Focus on situational problem solving, cross-functional collaboration, mentorship, and ownership.',
        evalStyle: 'Evaluate communication structure, emotional intelligence, leadership maturity, and clarity of impact.',
        greeting: "Hello! Welcome to our behavioral and leadership round. I'm looking forward to learning about your past engineering experiences, team collaboration, and how you approach complex workplace situations."
    }
};

// Helper to call OpenRouter API with retries and model fallbacks
async function callOpenRouter(messages, temperature = 0.7) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured in environment');
    }

    const models = [
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct',
        'qwen/qwen-2.5-72b-instruct',
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
                }),
                signal: AbortSignal.timeout(10000)
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
        const { 
            role, 
            level, 
            techStack, 
            interviewType, 
            questionCount = 5,
            mode = 'text',
            interviewerPersonality = 'Professional',
            durationMinutes = 30
        } = req.body || {};
        
        const user = req.user;

        if (user && user.credits < 10) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits. Please recharge your credits to start a new mock interview session.'
            });
        }

        const personalityConfig = INTERVIEWER_PERSONALITIES[interviewerPersonality] || INTERVIEWER_PERSONALITIES['Professional'];

        const prompt = `You are an expert ${personalityConfig.name} Interviewer (${personalityConfig.tone}).
${personalityConfig.style}

Generate a realistic, high-caliber set of ${questionCount} interview questions for:
- Role: ${role || 'Full Stack Developer'}
- Seniority Level: ${level || 'Mid-Level'}
- Target Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'JavaScript, React, Node.js'}
- Track: ${interviewType || 'Technical'}
- Interview Mode: ${mode === 'virtual' ? 'Virtual AI Voice Interview' : 'Standard Text Interview'}

Return STRICT valid JSON only (no markdown, no backticks):
{
  "title": "${level || 'Mid-Level'} ${role || 'Engineer'} Assessment",
  "overview": "Comprehensive assessment covering design, fundamentals, debugging, and real-world trade-offs.",
  "interviewerGreeting": "${personalityConfig.greeting}",
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
                interviewerGreeting: personalityConfig.greeting,
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

        if (!aiResult.interviewerGreeting) {
            aiResult.interviewerGreeting = personalityConfig.greeting;
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
            mode: mode || 'text',
            interviewerPersonality: interviewerPersonality || 'Professional',
            durationMinutes: Number(durationMinutes) || 30,
            questions: (aiResult.questions || []).map(q => ({
                question: q.question,
                category: q.category || 'General',
                userAnswer: '',
                answerMode: 'text',
                responseTime: 0,
                answerDuration: 0,
                fillerWordCount: 0,
                wordCount: 0,
                feedback: null
            })),
            analytics: {
                technicalKnowledge: 0,
                communication: 0,
                problemSolving: 0,
                clarity: 0,
                confidence: 0,
                totalTimeSeconds: 0,
                fillerWordCount: 0,
                avgResponseTime: 0
            },
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
            mode: sessionRecord.mode,
            interviewerPersonality: sessionRecord.interviewerPersonality,
            interviewerGreeting: personalityConfig.greeting,
            durationMinutes: sessionRecord.durationMinutes,
            remainingCredits: user ? user.credits : 90
        });
    } catch (error) {
        console.error('Error in generateQuestions:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate interview questions', error: error.message });
    }
};

// 2. Evaluate Answer in Real-time with Conversational & Multi-Metric Analytics
export const evaluateAnswer = async (req, res) => {
    try {
        const { 
            interviewId, 
            questionIndex = 0, 
            question, 
            userAnswer, 
            role, 
            level,
            mode = 'text',
            interviewerPersonality = 'Professional',
            answerMode = 'text',
            responseTime = 0,
            answerDuration = 0,
            fillerWordCount = 0,
            wordCount = 0
        } = req.body || {};

        if (!question || !userAnswer || userAnswer.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Question and candidate answer are required' });
        }

        const personalityConfig = INTERVIEWER_PERSONALITIES[interviewerPersonality] || INTERVIEWER_PERSONALITIES['Professional'];

        // Determine if answer is empty, skipped, non-attempt, or casual gibberish
        const trimmed = (userAnswer || '').trim();
        const isSkipOrIdk = /^(idk|i don'?t know|no idea|skip|pass|none|na|n\/a|not sure|dont know|hello|hi|test|\.+|\?+)$/i.test(trimmed) || trimmed.length < 10;

        const prompt = `You are a strict, objective, and expert ${personalityConfig.name} Technical Interviewer (${personalityConfig.tone}).
${personalityConfig.evalStyle}

Candidate Level: ${level || 'Mid-Level'}
Role: ${role || 'Software Engineer'}
Question: "${question}"
Candidate Answer: "${userAnswer}"
Answer Mode: ${answerMode} (${wordCount} words)

CRITICAL SCORING RUBRIC (BE ACCURATE & STRICT):
- 1 to 3: The candidate did not attempt the question, gave a non-answer (e.g. "idk", "I don't know", "skip", "pass", "no idea", "hello", gibberish), or gave a fundamentally wrong/irrelevant response.
- 4 to 5: Weak/incomplete attempt. Missing fundamental technical principles, heavily inaccurate, or superficial without real explanation.
- 6 to 7: Decent/acceptable answer with basic conceptual understanding, but lacking deep architectural trade-offs, edge cases, or scalability.
- 8 to 9: Strong, thorough, well-structured answer with technical terminology, design trade-offs, and accurate mechanics.
- 10: Exceptional mastery, FAANG-level depth, metrics, security, scalability, and edge case coverage.

DO NOT give high scores (like 7 or 8) to non-answers, skipped questions, or unattempted responses. If the candidate answered "I don't know", "idk", or gave a vague 1-sentence answer, assign a score of 1 to 3.

Return STRICT valid JSON only (no markdown, no backticks, no extra wrapper):
{
  "score": <number between 1 and 10 based strictly on answer quality>,
  "summary": "1-2 sentence honest and constructive evaluation summary tailored in the ${personalityConfig.name} style",
  "strengths": ["Specific strength demonstrated in the candidate's answer, or state what was acknowledged if unattempted"],
  "improvements": ["Specific technical growth areas and missing concepts that should have been explained"],
  "idealAnswer": "A comprehensive, 10/10 benchmark model response explaining the architecture, trade-offs, and best practices.",
  "followUpQuestion": "A targeted follow-up question to probe understanding (or a simpler fundamental question if the candidate struggled)",
  "technicalKnowledge": <number between 1 and 10>,
  "communication": <number between 1 and 10>,
  "problemSolving": <number between 1 and 10>,
  "clarity": <number between 1 and 10>,
  "confidence": <number between 1 and 10>,
  "adaptiveDecision": {
    "askFollowUp": true,
    "difficulty": "increase",
    "rationale": "Reason for difficulty adjustment"
  },
  "nextAdaptiveQuestion": "Next technical question adapted according to candidate performance."
}`;

        let evaluation;
        try {
            evaluation = await callOpenRouter([
                { role: 'system', content: 'You are an expert technical interviewer evaluator. Return ONLY valid JSON with strict and realistic scores based strictly on answer substance.' },
                { role: 'user', content: prompt }
            ]);
        } catch (e) {
            console.warn('Evaluation fallback active:', e.message);

            if (isSkipOrIdk) {
                evaluation = {
                    score: 1,
                    summary: "The question was unattempted or no substantive technical answer was provided.",
                    strengths: ["Question acknowledged"],
                    improvements: [
                        "Attempt to explain the core concepts even if uncertain",
                        "Break down the problem using first principles or the STAR framework"
                    ],
                    idealAnswer: "A complete 10/10 response defines the core architecture clearly, compares alternatives and trade-offs, outlines error resilience, and emphasizes security and observability.",
                    followUpQuestion: `Can you walk me through the basic high-level concept behind ${question.split(' ')[0] || 'this topic'}?`,
                    technicalKnowledge: 1,
                    communication: 2,
                    problemSolving: 1,
                    clarity: 2,
                    confidence: 1,
                    adaptiveDecision: {
                        askFollowUp: false,
                        difficulty: 'decrease',
                        rationale: "Unattempted question. Decreasing difficulty to assess fundamentals."
                    },
                    nextAdaptiveQuestion: `Let's step back to fundamentals: what is your general approach when solving problems in ${role || 'software development'}?`
                };
            } else if (trimmed.length < 50) {
                evaluation = {
                    score: 4,
                    summary: "Brief response provided, but lacks technical depth, trade-off analysis, and concrete architectural mechanics.",
                    strengths: ["Basic understanding of terminology"],
                    improvements: [
                        "Elaborate on real-world engineering constraints and trade-offs",
                        "Provide concrete examples from past production codebases"
                    ],
                    idealAnswer: "A complete 10/10 response defines the core architecture clearly, compares alternatives and trade-offs, outlines error resilience, and emphasizes security and observability.",
                    followUpQuestion: "Can you elaborate further on how this would be implemented in a live system?",
                    technicalKnowledge: 3,
                    communication: 4,
                    problemSolving: 3,
                    clarity: 4,
                    confidence: 4,
                    adaptiveDecision: {
                        askFollowUp: true,
                        difficulty: 'same',
                        rationale: "Basic response; probing for deeper architectural understanding."
                    },
                    nextAdaptiveQuestion: "How would you diagnose and resolve edge cases with this approach?"
                };
            } else {
                const calculatedScore = trimmed.length > 120 ? 8 : 6;
                evaluation = {
                    score: calculatedScore,
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
                    followUpQuestion: "How would your architecture evolve if request throughput grew 50x during peak traffic spikes?",
                    technicalKnowledge: calculatedScore,
                    communication: 7,
                    problemSolving: calculatedScore,
                    clarity: 7,
                    confidence: 7,
                    adaptiveDecision: {
                        askFollowUp: true,
                        difficulty: calculatedScore >= 8 ? 'increase' : 'same',
                        rationale: "Solid answers provided; follow-up tests scaling depth."
                    },
                    nextAdaptiveQuestion: "How would you diagnose and mitigate intermittent memory leaks or latency spikes in this architecture?"
                };
            }
        }

        // If the candidate gave a skip/idk answer, ensure score is clamped low even if AI returned higher
        if (isSkipOrIdk && evaluation) {
            evaluation.score = Math.min(evaluation.score || 1, 2);
            evaluation.technicalKnowledge = Math.min(evaluation.technicalKnowledge || 1, 2);
            evaluation.problemSolving = Math.min(evaluation.problemSolving || 1, 2);
        }

        // Ensure numbers are bounded 1-10
        const sanitizeScore = (val, fallback = 7) => {
            const num = Number(val);
            if (isNaN(num)) return fallback;
            return Math.min(10, Math.max(1, Math.round(num * 10) / 10));
        };

        evaluation.score = sanitizeScore(evaluation.score, 1);
        evaluation.technicalKnowledge = sanitizeScore(evaluation.technicalKnowledge, evaluation.score);
        evaluation.communication = sanitizeScore(evaluation.communication, isSkipOrIdk ? 2 : 7);
        evaluation.problemSolving = sanitizeScore(evaluation.problemSolving, evaluation.score);
        evaluation.clarity = sanitizeScore(evaluation.clarity, isSkipOrIdk ? 2 : 7);
        evaluation.confidence = sanitizeScore(evaluation.confidence, isSkipOrIdk ? 1 : 6);

        // Update Interview Record
        let updatedAnalytics = null;
        if (interviewId) {
            const idStr = String(interviewId);
            let session = memoryInterviews.get(idStr);

            if (!session && isDbConnected()) {
                try {
                    const dbDoc = await Interview.findById(interviewId);
                    if (dbDoc) {
                        session = dbDoc.toObject();
                    }
                } catch (e) {}
            }

            if (session) {
                if (!session.questions) session.questions = [];
                const questionRecord = {
                    question,
                    userAnswer,
                    answerMode: answerMode || 'text',
                    responseTime: Number(responseTime) || 0,
                    answerDuration: Number(answerDuration) || 0,
                    fillerWordCount: Number(fillerWordCount) || 0,
                    wordCount: Number(wordCount) || userAnswer.split(/\s+/).filter(Boolean).length,
                    feedback: evaluation
                };

                if (session.questions[questionIndex]) {
                    session.questions[questionIndex] = {
                        ...session.questions[questionIndex],
                        ...questionRecord
                    };
                } else {
                    session.questions.push(questionRecord);
                }

                // Recalculate multi-metric session analytics
                const evaluatedQuestions = session.questions.filter(q => q.feedback && typeof q.feedback.score === 'number');
                const count = evaluatedQuestions.length || 1;

                const avgMetric = (key) => {
                    const sum = evaluatedQuestions.reduce((acc, q) => acc + (q.feedback?.[key] || q.feedback?.score || 7), 0);
                    return Math.round((sum / count) * 10) / 10;
                };

                const totalFillerWords = session.questions.reduce((acc, q) => acc + (Number(q.fillerWordCount) || 0), 0);
                const totalDurationSecs = session.questions.reduce((acc, q) => acc + (Number(q.answerDuration) || 0), 0);
                const avgRespTime = Math.round(session.questions.reduce((acc, q) => acc + (Number(q.responseTime) || 0), 0) / count);

                session.overallScore = avgMetric('score');
                session.analytics = {
                    technicalKnowledge: avgMetric('technicalKnowledge'),
                    communication: avgMetric('communication'),
                    problemSolving: avgMetric('problemSolving'),
                    clarity: avgMetric('clarity'),
                    confidence: avgMetric('confidence'),
                    totalTimeSeconds: totalDurationSecs,
                    fillerWordCount: totalFillerWords,
                    avgResponseTime: avgRespTime
                };

                if (evaluatedQuestions.length === session.questions.length) {
                    session.status = 'completed';
                }

                memoryInterviews.set(idStr, session);
                updatedAnalytics = session.analytics;
            }

            if (isDbConnected()) {
                try {
                    const interview = await Interview.findById(interviewId);
                    if (interview) {
                        if (!interview.questions) interview.questions = [];
                        const qData = {
                            question,
                            userAnswer,
                            answerMode: answerMode || 'text',
                            responseTime: Number(responseTime) || 0,
                            answerDuration: Number(answerDuration) || 0,
                            fillerWordCount: Number(fillerWordCount) || 0,
                            wordCount: Number(wordCount) || 0,
                            feedback: evaluation
                        };

                        if (interview.questions[questionIndex]) {
                            Object.assign(interview.questions[questionIndex], qData);
                        } else {
                            interview.questions.push(qData);
                        }

                        if (session?.analytics) {
                            interview.analytics = session.analytics;
                            interview.overallScore = session.overallScore;
                            interview.status = session.status;
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
            feedback: evaluation,
            analytics: updatedAnalytics || {
                technicalKnowledge: evaluation.technicalKnowledge,
                communication: evaluation.communication,
                problemSolving: evaluation.problemSolving,
                clarity: evaluation.clarity,
                confidence: evaluation.confidence
            }
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
        const reqEmail = (user?.email || req.headers['x-guest-email'] || 'guest@interviewai.dev').toLowerCase();
        const reqUserId = user?._id ? String(user._id) : null;

        const sessionsMap = new Map();

        // 1. Fetch from MongoDB if available
        if (isDbConnected()) {
            try {
                const dbItems = await Interview.find({}).sort({ createdAt: -1 }).limit(50);
                dbItems.forEach(item => {
                    const obj = item.toObject ? item.toObject() : item;
                    sessionsMap.set(String(obj._id), obj);
                });
            } catch (e) {
                console.warn('DB history query notice:', e.message);
            }
        }

        // 2. Merge memory interviews
        memoryInterviews.forEach((val, key) => {
            sessionsMap.set(String(key), val);
        });

        // 3. Filter by candidate matching email or ID
        let allSessions = Array.from(sessionsMap.values());

        let userSessions = allSessions.filter(s => {
            const sEmail = (s.userEmail || '').toLowerCase();
            const sUserId = s.userId ? String(s.userId) : null;

            const emailMatch = sEmail && reqEmail && sEmail === reqEmail;
            const idMatch = sUserId && reqUserId && sUserId === reqUserId;

            return emailMatch || idMatch;
        });

        // Fallback: If no strict user match found, return all available sessions so user never sees empty history
        if (userSessions.length === 0) {
            userSessions = allSessions;
        }

        // Sort descending by creation date
        userSessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return res.status(200).json({
            success: true,
            interviews: userSessions
        });
    } catch (error) {
        console.error('Error in getInterviewHistory:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch interview history' });
    }
};

// 4. Delete Interview Record
export const deleteInterview = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Interview ID is required' });
        }

        memoryInterviews.delete(String(id));

        if (isDbConnected()) {
            try {
                await Interview.findByIdAndDelete(id);
            } catch (e) {
                console.warn('MongoDB delete notice:', e.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Interview session deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteInterview:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete interview session' });
    }
};

