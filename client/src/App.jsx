import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import InterviewSetup from './components/InterviewSetup.jsx';
import InterviewRoom from './components/InterviewRoom.jsx';
import AnswerFeedback from './components/AnswerFeedback.jsx';
import FinalReport from './components/FinalReport.jsx';
import HistoryAnalytics from './components/HistoryAnalytics.jsx';
import PricingModal from './components/PricingModal.jsx';
import AuthModal from './components/AuthModal.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  // Global State
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('interview'); // 'interview' | 'history'
  const [sessionStage, setSessionStage] = useState('setup'); // 'setup' | 'in-progress' | 'feedback' | 'report'

  // Modals
  const [pricingOpen, setPricingOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Interview Session Data
  const [currentInterviewId, setCurrentInterviewId] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Loading flags
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Initialize guest or sync user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('interviewai_token');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
          }
        } catch (e) {
          console.warn('Profile fetch error:', e);
        }
      } else {
        // Create local guest session if none
        let guestEmail = localStorage.getItem('interviewai_guest_email');
        if (!guestEmail) {
          guestEmail = `guest_${Math.random().toString(36).substring(7)}@interviewai.dev`;
          localStorage.setItem('interviewai_guest_email', guestEmail);
        }
        setUser({
          name: 'Demo Candidate',
          email: guestEmail,
          credits: 100
        });
      }
    };

    fetchUserProfile();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Start Interview Session
  const handleStartInterview = async (config) => {
    if (user && user.credits < 10) {
      setPricingOpen(true);
      showToast('You need at least 10 credits to start a new interview session.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('interviewai_token');
      const guestEmail = user?.email || localStorage.getItem('interviewai_guest_email') || 'guest@interviewai.dev';

      const res = await fetch(`${API_URL}/api/interview/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-guest-email': guestEmail
        },
        body: JSON.stringify(config)
      });

      const data = await res.json();
      if (data.success) {
        setInterviewData(data.data);
        setCurrentInterviewId(data.interviewId);
        setCurrentQuestionIndex(0);
        setEvaluations([]);
        setCurrentFeedback(null);
        setSessionStage('in-progress');

        if (typeof data.remainingCredits === 'number') {
          setUser(prev => prev ? { ...prev, credits: data.remainingCredits } : null);
        }
        showToast('Interview session generated successfully!');
      } else {
        showToast(data.message || 'Failed to generate interview questions.');
      }
    } catch (e) {
      console.error('Error starting interview:', e);
      showToast('Network error generating interview session.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Question Answer
  const handleAnswerSubmit = async (answer) => {
    setSubmitting(true);
    setCurrentAnswer(answer);
    try {
      const token = localStorage.getItem('interviewai_token');
      const currentQ = interviewData?.questions?.[currentQuestionIndex];

      const res = await fetch(`${API_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          interviewId: currentInterviewId,
          questionIndex: currentQuestionIndex,
          question: currentQ?.question,
          userAnswer: answer,
          role: interviewData?.title,
          level: 'Candidate'
        })
      });

      const data = await res.json();
      if (data.success) {
        setCurrentFeedback(data.feedback);
        setEvaluations(prev => [...prev, data.feedback]);
        setSessionStage('feedback');
      } else {
        showToast(data.message || 'Failed to evaluate answer.');
      }
    } catch (e) {
      console.error('Error evaluating answer:', e);
      showToast('Error getting answer feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Move to next question or show final scorecard
  const handleNextQuestion = () => {
    const totalQuestions = interviewData?.questions?.length || 0;
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentFeedback(null);
      setCurrentAnswer('');
      setSessionStage('in-progress');
    } else {
      setSessionStage('report');
    }
  };

  // 4. Retake / Reset session
  const handleResetInterview = () => {
    setSessionStage('setup');
    setInterviewData(null);
    setCurrentInterviewId(null);
    setCurrentQuestionIndex(0);
    setEvaluations([]);
    setCurrentFeedback(null);
  };

  // 5. Credit Top-up success
  const handleCreditSuccess = (creditsAdded) => {
    setUser(prev => prev ? { ...prev, credits: (prev.credits || 0) + creditsAdded } : null);
    showToast(`Successfully added ${creditsAdded} AI credits to your account!`);
  };

  // 6. Logout
  const handleLogout = () => {
    localStorage.removeItem('interviewai_token');
    setUser({
      name: 'Demo Candidate',
      email: `guest_${Math.random().toString(36).substring(7)}@interviewai.dev`,
      credits: 100
    });
    showToast('Logged out successfully.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#1e293b',
          border: '1px solid #6366f1',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '12px',
          zIndex: 2000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>⚡ {toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'interview' && sessionStage === 'report') {
            setSessionStage('setup');
          }
        }}
        onOpenPricing={() => setPricingOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'history' ? (
          <HistoryAnalytics user={user} apiUrl={API_URL} />
        ) : (
          <>
            {sessionStage === 'setup' && (
              <InterviewSetup
                onStartInterview={handleStartInterview}
                loading={loading}
                userCredits={user?.credits || 100}
              />
            )}

            {sessionStage === 'in-progress' && (
              <InterviewRoom
                interviewData={interviewData}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={interviewData?.questions?.length || 5}
                onAnswerSubmit={handleAnswerSubmit}
                submitting={submitting}
                onCancel={handleResetInterview}
              />
            )}

            {sessionStage === 'feedback' && (
              <AnswerFeedback
                feedback={currentFeedback}
                question={interviewData?.questions?.[currentQuestionIndex]?.question}
                userAnswer={currentAnswer}
                onNextQuestion={handleNextQuestion}
                isLastQuestion={currentQuestionIndex + 1 >= (interviewData?.questions?.length || 0)}
              />
            )}

            {sessionStage === 'report' && (
              <FinalReport
                interviewData={interviewData}
                evaluations={evaluations}
                onRetake={handleResetInterview}
                onGoHome={() => {
                  setSessionStage('setup');
                  setActiveTab('interview');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Pricing / Recharge Credits Modal */}
      <PricingModal
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onCreditSuccess={handleCreditSuccess}
        apiUrl={API_URL}
        user={user}
      />

      {/* Auth / Sign In Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          showToast(`Welcome, ${u.name || u.email}!`);
        }}
        apiUrl={API_URL}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        <p>InterviewAI • Production MERN Stack AI Mock Interview Platform • Powered by OpenRouter & Firebase</p>
      </footer>

    </div>
  );
}
