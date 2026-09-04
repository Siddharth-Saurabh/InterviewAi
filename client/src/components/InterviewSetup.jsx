import React, { useState } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Layers, 
  Code2, 
  MessageSquare, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Target, 
  Clock, 
  Compass,
  Trophy,
  Flame,
  Award
} from 'lucide-react';

const POPULAR_ROLES = [
  'Full Stack MERN Developer',
  'Frontend React Engineer',
  'Backend Node.js / Express',
  'System Design & Architecture',
  'DevOps & Cloud Engineer',
  'Data Scientist & ML',
  'Product Manager (Tech)'
];

const EXPERIENCE_LEVELS = [
  { id: 'Junior', label: 'Junior (0-2 Yrs)', desc: 'Fundamentals, syntax, and core problem solving' },
  { id: 'Mid-Level', label: 'Mid-Level (2-5 Yrs)', desc: 'System design, optimization, and project trade-offs' },
  { id: 'Senior', label: 'Senior (5+ Yrs)', desc: 'Architectural scale, leadership, and deep technical mastery' }
];

const INTERVIEW_ROUNDS = [
  {
    roundNumber: 1,
    id: 'Technical',
    title: 'Round 1: Technical Screening',
    tag: 'Core Concepts & Live Coding',
    icon: Code2,
    desc: 'Deep dive into language mechanics, algorithms, async data flows, and debugging.'
  },
  {
    roundNumber: 2,
    id: 'System Design',
    title: 'Round 2: System Design & Architecture',
    tag: 'Scalability & Microservices',
    icon: Layers,
    desc: 'High concurrency, database sharding, caching layers (Redis), and distributed reliability.'
  },
  {
    roundNumber: 3,
    id: 'Behavioral',
    title: 'Round 3: Behavioral & Bar Raiser',
    tag: 'STAR Framework & Leadership',
    icon: MessageSquare,
    desc: 'Executive communication, stakeholder trade-offs, conflict resolution, and culture fit.'
  }
];

const TECH_SUGGESTIONS = [
  'React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Next.js', 
  'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'TailwindCSS', 'Redis', 'Python'
];

export default function InterviewSetup({ onStartInterview, loading, userCredits, initialRound = 1 }) {
  const [role, setRole] = useState('Full Stack MERN Developer');
  const [customRole, setCustomRole] = useState('');
  const [level, setLevel] = useState('Mid-Level');
  const [selectedRound, setSelectedRound] = useState(initialRound);
  const [selectedTech, setSelectedTech] = useState(['React', 'Node.js', 'MongoDB', 'Express']);
  const [customTechInput, setCustomTechInput] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const toggleTech = (tech) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const addCustomTech = (e) => {
    if (e.key === 'Enter' && customTechInput.trim()) {
      e.preventDefault();
      if (!selectedTech.includes(customTechInput.trim())) {
        setSelectedTech([...selectedTech, customTechInput.trim()]);
      }
      setCustomTechInput('');
    }
  };

  const handleStart = () => {
    const finalRole = customRole.trim() ? customRole.trim() : role;
    const roundConfig = INTERVIEW_ROUNDS.find(r => r.roundNumber === selectedRound) || INTERVIEW_ROUNDS[0];

    onStartInterview({
      role: finalRole,
      level,
      roundNumber: selectedRound,
      interviewType: roundConfig.id,
      techStack: selectedTech,
      questionCount
    });
  };

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto 36px auto' }}>
        <div className="badge badge-primary" style={{ marginBottom: 14, padding: '6px 14px' }}>
          <Sparkles size={14} color="#818cf8" />
          <span>Full Multi-Round Tech Hiring Pipeline Simulator</span>
        </div>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
          fontWeight: 800, 
          lineHeight: 1.15, 
          letterSpacing: '-0.03em',
          marginBottom: 16 
        }}>
          Simulate Full Tech Hiring Rounds <br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            From Screening to Offer Letter
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Practice Round 1 (Technical Screening), Round 2 (System Architecture), and Round 3 (Bar Raiser). 
          Clear each stage to unlock the next round with real-time AI scoring and 10/10 model answers.
        </p>
      </div>

      {/* Setup Card */}
      <div className="glass-panel" style={{ 
        maxWidth: 920, 
        margin: '0 auto', 
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* 1. Interview Stage / Round Selector */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Compass size={18} color="#6366f1" />
              1. Select Interview Stage / Round
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
              {INTERVIEW_ROUNDS.map((rnd) => {
                const IconComponent = rnd.icon;
                const isSelected = selectedRound === rnd.roundNumber;
                return (
                  <div
                    key={rnd.roundNumber}
                    onClick={() => setSelectedRound(rnd.roundNumber)}
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      border: '1px solid',
                      borderColor: isSelected ? '#6366f1' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        <IconComponent size={16} color={isSelected ? '#818cf8' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? '#a5b4fc' : '#fff' }}>
                          ROUND {rnd.roundNumber}
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={18} color="#818cf8" />}
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      {rnd.title.split(': ')[1]}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {rnd.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Target Role */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Briefcase size={18} color="#06b6d4" />
              2. Select or Enter Target Role
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              {POPULAR_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setCustomRole(''); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: role === r && !customRole ? '#06b6d4' : 'var(--border-subtle)',
                    background: role === r && !customRole ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: role === r && !customRole ? '#22d3ee' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type a custom role (e.g., Senior iOS Engineer, Cloud Platform Architect...)"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 16px',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                marginTop: 6
              }}
            />
          </div>

          {/* 3. Seniority Level */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Target size={18} color="#a855f7" />
              3. Experience & Seniority Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {EXPERIENCE_LEVELS.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setLevel(exp.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: level === exp.id ? '#a855f7' : 'var(--border-subtle)',
                    background: level === exp.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: level === exp.id ? '#c084fc' : '#fff' }}>
                      {exp.label}
                    </span>
                    {level === exp.id && <CheckCircle2 size={18} color="#c084fc" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {exp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Tech Stack Tags */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Code2 size={18} color="#10b981" />
              4. Relevant Tech Stack & Frameworks
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {TECH_SUGGESTIONS.map((tech) => {
                const isSelected = selectedTech.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isSelected ? '#10b981' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                      color: isSelected ? '#34d399' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {tech}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Add extra skill or framework and press Enter..."
              value={customTechInput}
              onChange={(e) => setCustomTechInput(e.target.value)}
              onKeyDown={addCustomTech}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 16px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* 5. Question Count & Cost */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '18px 22px',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Clock size={20} color="var(--text-muted)" />
              <div>
                <span style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem' }}>
                  Round Length
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Questions in Round {selectedRound}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {[3, 5, 8].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: questionCount === cnt ? '#6366f1' : 'var(--border-subtle)',
                    background: questionCount === cnt ? '#6366f1' : 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button
              onClick={handleStart}
              disabled={loading}
              className="glow-btn"
              style={{
                width: '100%',
                padding: '16px 28px',
                fontSize: '1.15rem',
                borderRadius: '14px'
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="wave-bar" style={{ height: 16 }} />
                  <div className="wave-bar" style={{ height: 22 }} />
                  <div className="wave-bar" style={{ height: 14 }} />
                  <span>Synthesizing Round {selectedRound} with AI...</span>
                </div>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Start Round {selectedRound}: {INTERVIEW_ROUNDS.find(r => r.roundNumber === selectedRound)?.title.split(': ')[1]}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Costs 10 Credits • Instant Generation • Audio Voice Narration & Speech-to-Text Ready
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
