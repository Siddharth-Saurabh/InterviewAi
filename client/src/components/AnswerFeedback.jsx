import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Award,
  HelpCircle
} from 'lucide-react';

export default function AnswerFeedback({ 
  feedback, 
  question, 
  userAnswer, 
  onNextQuestion, 
  isLastQuestion 
}) {
  const score = feedback?.score || 7;

  // Dynamic score color
  const getScoreColor = (sc) => {
    if (sc >= 8) return '#10b981';
    if (sc >= 6) return '#fbbf24';
    return '#f43f5e';
  };

  return (
    <div className="container" style={{ maxWidth: 1000, paddingBottom: 60 }}>
      {/* Score Header Card */}
      <div className="glass-panel" style={{ 
        padding: '30px 36px', 
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.9) 0%, rgba(30, 41, 67, 0.6) 100%)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: 8 }}>
              <Award size={14} color="#818cf8" />
              AI Evaluator Scorecard
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Detailed Answer Feedback
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>
              {feedback?.summary || 'Objective evaluation calculated across technical depth, correctness, and structure.'}
            </p>
          </div>

          {/* Circular Score Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.4)',
            border: `3px solid ${getScoreColor(score)}`,
            boxShadow: `0 0 20px ${getScoreColor(score)}40`
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: getScoreColor(score), lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              OUT OF 10
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Strengths */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>
              Demonstrated Strengths
            </h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(feedback?.strengths || ['Good foundational clarity and accurate technical terminology.']).map((str, i) => (
              <li key={i} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 10,
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.5
              }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbbf24' }}>
              Actionable Growth Areas
            </h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(feedback?.improvements || ['Include concrete production scaling examples and edge-case handling.']).map((imp, i) => (
              <li key={i} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 10,
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                lineHeight: 1.5
              }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Ideal Model Answer Section */}
      {feedback?.idealAnswer && (
        <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 24, borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <BookOpen size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22d3ee' }}>
              Benchmark 10/10 Model Response
            </h3>
          </div>
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#e2e8f0', 
            lineHeight: 1.7, 
            whiteSpace: 'pre-wrap',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '16px 20px',
            borderRadius: '10px'
          }}>
            {feedback.idealAnswer}
          </p>
        </div>
      )}

      {/* Follow Up Question */}
      {feedback?.followUpQuestion && (
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: 28, background: 'rgba(99, 102, 241, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <HelpCircle size={18} color="#818cf8" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8' }}>
              Interviewer Follow-Up Probe:
            </h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic' }}>
            "{feedback.followUpQuestion}"
          </p>
        </div>
      )}

      {/* Next Step Action Button */}
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={onNextQuestion}
          className="glow-btn"
          style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '12px' }}
        >
          <span>{isLastQuestion ? 'View Final Session Scorecard' : 'Proceed to Next Question'}</span>
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
