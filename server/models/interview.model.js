import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    userEmail: {
        type: String,
        default: 'guest@interviewai.dev'
    },
    role: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Junior', 'Mid-Level', 'Senior', 'Lead/Architect'],
        default: 'Mid-Level'
    },
    techStack: [String],
    interviewType: {
        type: String,
        enum: ['Technical', 'Behavioral', 'System Design', 'Live Coding', 'HR'],
        default: 'Technical'
    },
    mode: {
        type: String,
        enum: ['text', 'virtual'],
        default: 'text'
    },
    interviewerPersonality: {
        type: String,
        default: 'Professional'
    },
    durationMinutes: {
        type: Number,
        default: 30
    },
    questions: [
        {
            question: String,
            category: String,
            userAnswer: String,
            answerMode: {
                type: String,
                enum: ['text', 'voice'],
                default: 'text'
            },
            responseTime: {
                type: Number,
                default: 0
            },
            answerDuration: {
                type: Number,
                default: 0
            },
            fillerWordCount: {
                type: Number,
                default: 0
            },
            wordCount: {
                type: Number,
                default: 0
            },
            feedback: {
                score: Number, // 1 to 10
                strengths: [String],
                improvements: [String],
                idealAnswer: String,
                summary: String,
                followUpQuestion: String,
                technicalKnowledge: Number,
                communication: Number,
                problemSolving: Number,
                clarity: Number,
                confidence: Number
            }
        }
    ],
    analytics: {
        technicalKnowledge: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        totalTimeSeconds: { type: Number, default: 0 },
        fillerWordCount: { type: Number, default: 0 },
        avgResponseTime: { type: Number, default: 0 }
    },
    overallScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    }
}, {
    timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
