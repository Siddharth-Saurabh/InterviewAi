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
    questions: [
        {
            question: String,
            category: String,
            userAnswer: String,
            feedback: {
                score: Number, // 1 to 10
                strengths: [String],
                improvements: [String],
                idealAnswer: String,
                summary: String
            }
        }
    ],
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
