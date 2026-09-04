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
  Compass
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

const INTERVIEW_TYPES = [
  { id: 'Technical', icon: Code2, label: 'Technical Depth', desc: 'Core engineering concepts, live algorithms & architecture' },
  { id: 'Behavioral', icon: MessageSquare, label: 'Behavioral & STAR', desc: 'Communication, conflict resolution, leadership and cultural fit' },
  { id: 'System Design', icon: Layers, label: 'System Design', desc: 'High concurrency, database scaling, caching, and microservices' }
];

const TECH_SUGGESTIONS = [
  'React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Next.js', 
  'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'TailwindCSS', 'Redis', 'Python'
];

export default function InterviewSetup({ onStartInterview, loading, userCredits }) {
  const [role, setRole] = useState('Full Stack MERN Developer');
  const [customRole, setCustomRole] = useState('');
  const [level, setLevel] = useState('Mid-Level');
  const [interviewType, setInterviewType] = useState('Technical');
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
    onStartInterview({
      role: finalRole,
      level,
      interviewType,
      techStack: selectedTech,
      questionCount
    });
  };

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 36px auto' }}>
        <div className="badge badge-primary" style={{ marginBottom: 14, padding: '6px 14px' }}>
          <Sparkles size={14} color="#818cf8" />
          <span>Next-Gen AI Mock Interview Simulator</span>
        </div>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
          fontWeight: 800, 
          lineHeight: 1.15, 
          letterSpacing: '-0.03em',
          marginBottom: 16 
        }}>
          Ace Your Next Interview with <br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Real-Time AI Mentorship
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Simulate realistic hiring rounds tailored for high-growth tech companies. 
          Get instant scoring, in-depth architectural feedback, voice synthesis, and benchmark answers.
        </p>
      </div>

      {/* Setup Card Grid */}
      <div className="glass-panel" style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* 1. Target Role */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Briefcase size={18} color="#6366f1" />
              1. Select or Enter Target Role
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
                    borderColor: role === r && !customRole ? '#6366f1' : 'var(--border-subtle)',
                    background: role === r && !customRole ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: role === r && !customRole ? '#818cf8' : 'var(--text-main)',
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
              placeholder="Or type a custom role (e.g., iOS Swift Engineer, Solana Web3 Dev...)"
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

          {/* 2. Experience Level */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Target size={18} color="#06b6d4" />
              2. Experience & Seniority Level
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
                    borderColor: level === exp.id ? '#06b6d4' : 'var(--border-subtle)',
                    background: level === exp.id ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: level === exp.id ? '#22d3ee' : '#fff' }}>
                      {exp.label}
                    </span>
                    {level === exp.id && <CheckCircle2 size={18} color="#22d3ee" />}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {exp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interview Focus / Type */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14, fontSize: '1.05rem' }}>
              <Compass size={18} color="#a855f7" />
              3. Interview Track & Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {INTERVIEW_TYPES.map((t) => {
                const IconComponent = t.icon;
                const isSelected = interviewType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setInterviewType(t.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isSelected ? '#a855f7' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        padding: 6,
                        borderRadius: 8,
                        background: isSelected ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)'
                      }}>
                        <IconComponent size={18} color={isSelected ? '#c084fc' : 'var(--text-muted)'} />
                      </div>
                      <span style={{ fontWeight: 700, color: isSelected ? '#c084fc' : '#fff' }}>
                        {t.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {t.desc}
                    </p>
                  </div>
                );
              })}
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
                  Interview Length
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Questions per session
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
                  <span>Synthesizing Interview Session with AI...</span>
                </div>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Start AI Mock Interview</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Costs 10 Credits • Instant Question Generation • Audio & Live Voice Ready
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
