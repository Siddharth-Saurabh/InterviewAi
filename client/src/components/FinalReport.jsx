import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  CheckCircle, 
  BarChart3, 
  Layers, 
  Share2,
  Download,
  Flame
} from 'lucide-react';

export default function FinalReport({ interviewData, evaluations, onRetake, onGoHome }) {
  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti effect skipped:', e);
    }
  }, []);

  const scores = evaluations.map(e => e.score || 7);
  const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length || 1)) * 10) / 10;

  const getReadinessLevel = (avg) => {
    if (avg >= 8.5) return { text: 'Strong Hire / FAANG Ready', color: '#10b981', badge: 'Exceptional' };
    if (avg >= 7.0) return { text: 'Hire / Solid Production Ready', color: '#06b6d4', badge: 'Competent' };
    if (avg >= 5.5) return { text: 'Needs Target Polish', color: '#fbbf24', badge: 'Developing' };
    return { text: 'Foundational Review Needed', color: '#f43f5e', badge: 'Needs Work' };
  };

  const readiness = getReadinessLevel(averageScore);

  return (
    <div className="container" style={{ maxWidth: 960, paddingBottom: 80 }}>
      {/* Top Banner Card */}
      <div className="glass-panel" style={{ 
        padding: '40px 36px', 
        textAlign: 'center', 
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
        }}>
          <Trophy size={36} color="#fff" />
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>
          Interview Session Completed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto 24px auto' }}>
          Here is your comprehensive hiring evaluation based on industry-standard engineering benchmarks.
        </p>

        {/* Score and Readiness Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 24, 
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '16px 28px'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: readiness.color, lineHeight: 1 }}>
              {averageScore} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ 10</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OVERALL SCORE</span>
          </div>

          <div style={{ width: 1, height: 40, background: 'var(--border-subtle)' }} />

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {readiness.text}
            </div>
            <span className="badge badge-success" style={{ background: `${readiness.color}20`, color: readiness.color, border: `1px solid ${readiness.color}40` }}>
              {readiness.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Per-Question Review List */}
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <BarChart3 size={20} color="#6366f1" />
        Question-by-Question Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
        {evaluations.map((ev, idx) => {
          const q = interviewData?.questions?.[idx] || {};
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="badge badge-primary">Q{idx + 1} • {q.category || 'Technical'}</span>
                <span style={{ 
                  fontWeight: 800, 
                  color: (ev.score || 7) >= 8 ? '#10b981' : '#fbbf24',
                  fontSize: '1rem' 
                }}>
                  Score: {ev.score || 7}/10
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 10 }}>
                {q.question}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                💡 <strong>Evaluation:</strong> {ev.summary || 'Solid conceptual answers demonstrated with room for deeper optimization examples.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={onRetake}
          className="glow-btn"
          style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }}
        >
          <RotateCcw size={18} />
          <span>Retake or Start New Role</span>
        </button>

        <button
          onClick={onGoHome}
          className="secondary-btn"
          style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '12px' }}
        >
          <span>Return to Dashboard</span>
        </button>
      </div>

    </div>
  );
}
