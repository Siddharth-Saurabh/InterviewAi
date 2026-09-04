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
  Flame, 
  Home, 
  ArrowRight, 
  ShieldCheck, 
  Award,
  Crown
} from 'lucide-react';

export default function FinalReport({ 
  interviewData, 
  evaluations, 
  onRetake, 
  onGoHome, 
  onAdvanceNextRound,
  currentRound = 1 
}) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  const scores = evaluations.map(e => e.score || 7);
  const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length || 1)) * 10) / 10;
  const passed = averageScore >= 6.5;

  const getReadinessLevel = (avg) => {
    if (avg >= 8.5) return { text: 'Strong Hire / FAANG Tier', color: '#10b981', badge: 'Exceptional' };
    if (avg >= 7.0) return { text: 'Hire / Production Ready', color: '#06b6d4', badge: 'Passed' };
    if (avg >= 5.5) return { text: 'Borderline / Needs Polish', color: '#fbbf24', badge: 'Developing' };
    return { text: 'Foundational Review Needed', color: '#f43f5e', badge: 'Not Passed' };
  };

  const readiness = getReadinessLevel(averageScore);

  // Next round details
  const getNextRoundInfo = () => {
    if (currentRound === 1) {
      return {
        nextNumber: 2,
        title: 'Round 2: System Design & Architecture',
        desc: 'Test scalability, high-concurrency databases, Redis caching, and microservices.',
        btnText: 'Advance to Round 2 (System Design)'
      };
    }
    if (currentRound === 2) {
      return {
        nextNumber: 3,
        title: 'Round 3: Behavioral & Bar Raiser',
        desc: 'Test executive communication, STAR framework, conflict resolution, and leadership.',
        btnText: 'Advance to Round 3 (Bar Raiser)'
      };
    }
    return null;
  };

  const nextRound = getNextRoundInfo();

  // Export report
  const handleDownloadReport = () => {
    let reportContent = `# InterviewAI Scorecard Report\n`;
    reportContent += `**Role:** ${interviewData?.title || 'Software Engineer'}\n`;
    reportContent += `**Round:** Round ${currentRound}\n`;
    reportContent += `**Date:** ${new Date().toLocaleDateString()}\n`;
    reportContent += `**Overall Score:** ${averageScore} / 10 (${readiness.text})\n\n`;
    reportContent += `---\n\n## Question Breakdown\n\n`;

    evaluations.forEach((ev, idx) => {
      const q = interviewData?.questions?.[idx] || {};
      reportContent += `### Question ${idx + 1}: ${q.question || 'Technical Question'}\n`;
      reportContent += `- **Score:** ${ev.score || 7} / 10\n`;
      reportContent += `- **Category:** ${q.category || 'Technical'}\n`;
      reportContent += `- **Summary:** ${ev.summary || ''}\n`;
      reportContent += `- **Strengths:**\n`;
      (ev.strengths || []).forEach(s => reportContent += `  - ${s}\n`);
      reportContent += `- **Growth Areas:**\n`;
      (ev.improvements || []).forEach(imp => reportContent += `  - ${imp}\n`);
      if (ev.idealAnswer) {
        reportContent += `- **Model Benchmark Answer:**\n  ${ev.idealAnswer}\n`;
      }
      reportContent += `\n---\n\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InterviewAI_Round${currentRound}_Report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          background: currentRound === 3 && passed 
            ? 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
        }}>
          {currentRound === 3 && passed ? <Crown size={38} color="#fff" /> : <Trophy size={36} color="#fff" />}
        </div>

        <div className="badge badge-primary" style={{ marginBottom: 10 }}>
          {currentRound === 3 ? 'Final Round 3 Completed' : `Round ${currentRound} Completed`}
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>
          {currentRound === 3 && passed
            ? '🎉 Congratulations! You Cleared All 3 Hiring Rounds!'
            : `Round ${currentRound} Scorecard & Evaluation`}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 640, margin: '0 auto 24px auto' }}>
          {currentRound === 3 && passed
            ? 'Outstanding performance across Technical Screening, System Design, and Behavioral Bar Raiser. You meet the benchmark for a Top-Tier Offer!'
            : 'Review your detailed evaluation, strengths, and areas for improvement below.'}
        </p>

        {/* Score and Readiness Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 24, 
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '16px 28px',
          flexWrap: 'wrap',
          justifyContent: 'center'
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

      {/* Next Round Progression Banner */}
      {passed && nextRound && (
        <div className="glass-panel" style={{
          padding: '24px 28px',
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: 6 }}>
              ✨ Stage Cleared • Advance to Next Stage
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {nextRound.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
              {nextRound.desc}
            </p>
          </div>

          <button
            onClick={() => onAdvanceNextRound(nextRound.nextNumber)}
            className="glow-btn"
            style={{ padding: '12px 24px', fontSize: '0.95rem', borderRadius: '12px' }}
          >
            <span>{nextRound.btnText}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Per-Question Review List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={20} color="#6366f1" />
          Round {currentRound} Question-by-Question Breakdown
        </h3>

        <button
          onClick={handleDownloadReport}
          className="secondary-btn"
          style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
        >
          <Download size={15} />
          <span>Export Scorecard (.md)</span>
        </button>
      </div>

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
          <span>Retake or Select New Stage</span>
        </button>

        <button
          onClick={onGoHome}
          className="secondary-btn"
          style={{ padding: '14px 24px', fontSize: '1rem', borderRadius: '12px' }}
        >
          <Home size={18} />
          <span>Return to Dashboard</span>
        </button>
      </div>

    </div>
  );
}
