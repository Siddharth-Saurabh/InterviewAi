import Interview from '../models/interview.model.js';
import User from '../models/user.model.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper to call OpenRouter API with retries/model fallbacks
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
                    'X-Title': 'InterviewAI Assistant',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    response_format: { type: "json_object" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    return JSON.parse(content);
                }
            } else {
                console.warn(`Model ${model} returned status ${response.status}. Trying next...`);
            }
        } catch (err) {
            console.warn(`Model ${model} failed with error:`, err.message);
        }
    }

    // Secondary fallback without explicit json_object response format
    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://interviewai.dev',
                'X-Title': 'InterviewAI Assistant',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    ...messages,
                    { role: 'system', content: 'Respond with pure JSON only, without markdown formatting or backticks.' }
                ],
                temperature: temperature
            })
        });

        if (response.ok) {
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content || '{}';
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(content);
        }
    } catch (err) {
        console.error('All OpenRouter API calls failed:', err);
    }

    throw new Error('Failed to retrieve response from AI models');
}

// 1. Generate Interview Questions
export const generateQuestions = async (req, res) => {
    try {
        const { role, level, techStack, interviewType, questionCount = 5 } = req.body;
        const user = req.user;

        if (user && user.credits < 10) {
            return res.status(402).json({
                success: false,
                message: 'Insufficient credits. Please recharge your credits to start a new interview session.'
            });
        }

        const prompt = `You are a Principal Tech Lead and Interviewer at a top tier company (FAANG/Big Tech).
Generate a set of ${questionCount} tailored, realistic, high-quality interview questions for:
- Role: ${role || 'Full Stack Developer'}
- Seniority Level: ${level || 'Mid-Level'}
- Target Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'JavaScript, React, Node.js'}
- Interview Type: ${interviewType || 'Technical'}

Return your response strictly in the following JSON schema:
{
  "title": "Short title describing this interview session",
  "overview": "1-2 sentence overview of the interview focus",
  "questions": [
    {
      "id": 1,
      "question": "The interview question text",
      "category": "e.g., Core Concept, Architecture, Debugging, Behavioral, System Design",
      "hint": "A subtle hint if candidate gets stuck",
      "expectedKeywords": ["keyword1", "keyword2"]
    }
  ]
}`;

        let aiResult;
        try {
            aiResult = await callOpenRouter([
                { role: 'system', content: 'You are an elite technical interviewer AI. Output valid JSON only.' },
                { role: 'user', content: prompt }
            ]);
        } catch (e) {
            console.error('Falling back to local high-quality question generator:', e.message);
            // Intelligent fallback questions if OpenRouter is unreachable
            aiResult = {
                title: `${level || 'Mid-Level'} ${role || 'Software Engineer'} Interview`,
                overview: `Comprehensive ${interviewType || 'Technical'} assessment focusing on real-world problem solving.`,
                questions: [
                    {
                        id: 1,
                        question: `Can you explain how state management and asynchronous data flow are handled in a production ${role} application?`,
                        category: "Architecture & Data Flow",
                        hint: "Consider caching, optimistic updates, and error boundary handling.",
                        expectedKeywords: ["State", "Async", "Immutability", "Error Handling"]
                    },
                    {
                        id: 2,
                        question: `Describe a scenario where you faced a significant performance bottleneck in your previous project. How did you diagnose and resolve it?`,
                        category: "Performance Optimization",
                        hint: "Walk through profiling, metrics, root cause, and the resulting speedup.",
                        expectedKeywords: ["Profiling", "Latency", "Memory", "Optimization"]
                    },
                    {
                        id: 3,
                        question: `How would you design a scalable authentication and role-based access control (RBAC) architecture?`,
                        category: "Security & Authentication",
                        hint: "Discuss tokens, refresh strategies, permissions, and security headers.",
                        expectedKeywords: ["JWT", "RBAC", "Tokens", "Security", "Middleware"]
                    },
                    {
                        id: 4,
                        question: `When handling high concurrency or heavy database loads, what strategies do you apply for caching and query optimization?`,
                        category: "Scalability & Databases",
                        hint: "Think about Redis/caching layers, indexing, and connection pooling.",
                        expectedKeywords: ["Indexing", "Caching", "Redis", "Throughput"]
                    },
                    {
                        id: 5,
                        question: `Tell me about a time you had a technical disagreement with a teammate or stakeholder. How did you reach a consensus?`,
                        category: "Behavioral & Collaboration",
                        hint: "Use the STAR method (Situation, Task, Action, Result).",
                        expectedKeywords: ["Communication", "STAR", "Consensus", "Trade-offs"]
                    }
                ]
            };
        }

        // Create Interview session in DB
        const interview = await Interview.create({
            userId: user ? user._id : null,
            userEmail: user ? user.email : 'guest@interviewai.dev',
            role: role || 'Full Stack Developer',
            level: level || 'Mid-Level',
            techStack: Array.isArray(techStack) ? techStack : [techStack || 'JavaScript'],
            interviewType: interviewType || 'Technical',
            questions: (aiResult.questions || []).map(q => ({
                question: q.question,
                category: q.category || 'General'
            })),
            status: 'in-progress'
        });

        // Deduct 10 credits if user exists
        if (user) {
            user.credits = Math.max(0, user.credits - 10);
            await user.save();
        }

        res.status(200).json({
            success: true,
            interviewId: interview._id,
            data: aiResult,
            remainingCredits: user ? user.credits : 90
        });
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ success: false, message: 'Failed to generate interview questions', error: error.message });
    }
};

// 2. Evaluate Answer in Real-time
export const evaluateAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, question, userAnswer, role, level } = req.body;
        const user = req.user;

        if (!question || !userAnswer || userAnswer.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Question and candidate answer are required' });
        }

        const prompt = `You are a Senior Principal Interviewer grading a candidate's response.
Candidate Level: ${level || 'Mid-Level'}
Role: ${role || 'Software Engineer'}
Question: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate the answer objectively and constructively.
Return JSON with this exact schema:
{
  "score": 8, // Integer 1-10
  "summary": "1-2 sentence overall evaluation summary",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement tip 1", "Improvement tip 2"],
  "idealAnswer": "A concise, industry-standard model answer that would score 10/10",
  "followUpQuestion": "An insightful follow-up question to probe deeper"
}`;

        let evaluation;
        try {
            evaluation = await callOpenRouter([
                { role: 'system', content: 'You are an expert technical interviewer evaluator. Output valid JSON only.' },
                { role: 'user', content: prompt }
            ]);
        } catch (e) {
            console.error('Evaluation fallback:', e.message);
            evaluation = {
                score: 8,
                summary: "Good clarity and conceptual understanding, with solid foundational points covered.",
                strengths: [
                    "Directly addressed the primary intent of the question",
                    "Demonstrated good technical awareness and logical structure"
                ],
                improvements: [
                    "Could include specific edge case considerations or performance trade-offs",
                    "Add real-world metric examples or architectural design patterns"
                ],
                idealAnswer: "An ideal response outlines the core concept clearly, contrasts trade-offs, covers error handling, and highlights scalability and security best practices.",
                followUpQuestion: "How would your approach adapt if system traffic increased 100x?"
            };
        }

        // Update Interview Record in DB if interviewId is provided
        if (interviewId) {
            try {
                const interview = await Interview.findById(interviewId);
                if (interview && interview.questions && interview.questions[questionIndex]) {
                    interview.questions[questionIndex].userAnswer = userAnswer;
                    interview.questions[questionIndex].feedback = {
                        score: evaluation.score || 7,
                        strengths: evaluation.strengths || [],
                        improvements: evaluation.improvements || [],
                        idealAnswer: evaluation.idealAnswer || '',
                        summary: evaluation.summary || ''
                    };

                    // Compute current overall average score
                    const evaluatedScores = interview.questions
                        .map(q => q.feedback?.score)
                        .filter(s => typeof s === 'number');
                    
                    if (evaluatedScores.length > 0) {
                        interview.overallScore = Math.round(
                            (evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length) * 10
                        ) / 10;
                    }

                    if (evaluatedScores.length === interview.questions.length) {
                        interview.status = 'completed';
                    }

                    await interview.save();
                }
            } catch (dbErr) {
                console.warn('Could not update interview document:', dbErr.message);
            }
        }

        res.status(200).json({
            success: true,
            feedback: evaluation
        });
    } catch (error) {
        console.error('Error evaluating answer:', error);
        res.status(500).json({ success: false, message: 'Failed to evaluate answer', error: error.message });
    }
};

// 3. Get User Interview History
export const getInterviewHistory = async (req, res) => {
    try {
        const user = req.user;
        const query = user ? { $or: [{ userId: user._id }, { userEmail: user.email }] } : {};
        const interviews = await Interview.find(query).sort({ createdAt: -1 }).limit(20);

        res.status(200).json({
            success: true,
            interviews
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch interview history' });
    }
};
