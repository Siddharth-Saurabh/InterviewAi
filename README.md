# InterviewAI 🚀

**InterviewAI** is an AI-powered mock interview simulator and technical preparation platform built with the **MERN stack**, **OpenRouter AI**, **Firebase Auth**, and **Razorpay** payment gateway integration.

---

## 🌟 Key Features

- 🤖 **AI-Driven Dynamic Interview Simulator**: 
  - Tailored questions for roles including Full Stack (MERN), Frontend React, Backend Node/Express, System Design, DevOps, Data Science, and Custom Roles.
  - Multi-tier seniority levels: Junior (0-2 Yrs), Mid-Level (2-5 Yrs), and Senior (5+ Yrs).
  - Interview formats: Technical Depth, Behavioral (STAR Method), and System Architecture.
- 🎙️ **Voice Speech-to-Text & Audio Narration**:
  - Live AI interviewer avatar with audio wave animation.
  - Web Speech Synthesis for natural question narration.
  - Web Speech Recognition API for seamless voice responses.
- 📊 **Instant Multi-Metric AI Feedback & Scorecard**:
  - Real-time scoring out of 10 for every response.
  - Demonstrated strengths & actionable growth points.
  - 10/10 Benchmark model answers and dynamic interviewer follow-up questions.
  - Session completion summary and readiness rating.
- 💳 **Credit System & Razorpay Integration**:
  - Live credit counter and deduction per session.
  - Dummy/Mock Razorpay checkout simulation for local testing with plans (50, 150, 500 credits).
  - Live Razorpay verification support.
- 🔐 **Firebase Authentication & User Management**:
  - Google Sign-In with Firebase Auth.
  - Instant email access with demo candidate session support.
- 🎨 **Responsive Glassmorphic UI**:
  - Sleek dark theme with responsive mobile navigation drawer, glowing badges, audio wave visualizers, and celebratory confetti effects.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Lucide React** (Modern Icons)
- **Firebase JS SDK** (Authentication)
- **Canvas Confetti** (Celebration animations)
- **Vanilla CSS3** (Glassmorphism & Responsive layout)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **OpenRouter AI API** (DeepSeek / Gemini / LLaMA model chains)
- **Razorpay SDK & Crypto Signature Verification**
- **JWT & Cookie Parser**

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### 2. Environment Variables

Create `.env` in the `server` directory:
```env
PORT=8000
MONGO_URL=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
JWT_SECRET=your_jwt_secret
```

Create `.env` in the `client` directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_API_URL=http://localhost:8000
```

---

### 3. Installation & Running Locally

#### Run Backend Server
```bash
cd server
npm install
npm run dev
```

#### Run Frontend Client
```bash
cd client
npm install
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/sync` | Sync user with Firebase / Email login |
| `GET` | `/api/auth/profile` | Get current user profile and credits |
| `POST` | `/api/interview/generate` | Generate AI interview questions |
| `POST` | `/api/interview/evaluate` | Evaluate candidate response |
| `GET` | `/api/interview/history` | Retrieve user interview history |
| `GET` | `/api/payment/plans` | Fetch available credit recharge plans |
| `POST` | `/api/payment/create-order`| Create Razorpay order (or mock order) |
| `POST` | `/api/payment/verify-payment`| Verify payment & recharge credits |

---

## 📜 License
ISC
