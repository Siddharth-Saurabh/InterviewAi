import React, { useState, useEffect } from 'react';
import { 
  History, 
  Calendar, 
  Award, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function HistoryAnalytics({ user, apiUrl }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('interviewai_token');
      const guestEmail = user?.email || localStorage.getItem('interviewai_guest_email') || 'guest@interviewai.dev';
      
      const res = await fetch(`${apiUrl}/api/interview/history`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-guest-email': guestEmail
        }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.interviews || []);
      }
    } catch (e) {
      console.warn('Failed to fetch history:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1000, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="badge badge-primary" style={{ marginBottom: 8 }}>
          <History size={14} color="#818cf8" />
          <span>Performance Record</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
          Your Mock Interview History
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review past evaluations, question breakdowns, and track your readiness progression.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="wave-bar" style={{ display: 'inline-block', height: 24, margin: '0 4px' }} />
          <div className="wave-bar" style={{ display: 'inline-block', height: 32, margin: '0 4px' }} />
          <div className="wave-bar" style={{ display: 'inline-block', height: 20, margin: '0 4px' }} />
          <p style={{ marginTop: 14, color: 'var(--text-muted)' }}>Loading past mock sessions...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Sparkles size={36} color="#6366f1" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No Past Sessions Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto' }}>
            Start your first AI mock interview session to automatically record your scorecards and growth analysis here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map((item) => (
            <div 
              key={item._id} 
              className="glass-panel" 
              style={{ padding: '22px 28px', cursor: 'pointer' }}
              onClick={() => setSelectedSession(selectedSession?._id === item._id ? null : item)}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14 
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className="badge badge-primary">{item.level || 'Mid-Level'}</span>
                    <span className="badge badge-cyan">{item.interviewType || 'Technical'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    {item.role}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: 800, 
                      color: (item.overallScore || 0) >= 8 ? '#10b981' : '#fbbf24' 
                    }}>
                      {item.overallScore || 'N/A'} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/10</span>
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Session Score
                    </span>
                  </div>

                  <ChevronRight 
                    size={20} 
                    color="var(--text-muted)" 
                    style={{ 
                      transform: selectedSession?._id === item._id ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </div>
              </div>

              {/* Accordion Questions Details */}
              {selectedSession?._id === item._id && (
                <div style={{ 
                  marginTop: 20, 
                  paddingTop: 18, 
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8' }}>
                    Questions & Answers in this session:
                  </h4>
                  {item.questions?.map((q, qIdx) => (
                    <div key={qIdx} style={{ 
                      background: 'rgba(0,0,0,0.3)', 
                      padding: '14px 18px', 
                      borderRadius: '10px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e2e8f0' }}>
                          Q{qIdx + 1}: {q.question}
                        </span>
                        {q.feedback?.score && (
                          <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem' }}>
                            Score: {q.feedback.score}/10
                          </span>
                        )}
                      </div>
                      {q.userAnswer && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          <em>Your answer:</em> "{q.userAnswer.slice(0, 140)}..."
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
