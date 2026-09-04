import React, { useState } from 'react';
import { 
  Sparkles, 
  Coins, 
  History, 
  PlayCircle, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  Zap
} from 'lucide-react';

export default function Navbar({ 
  user, 
  activeTab, 
  setActiveTab, 
  onOpenPricing, 
  onOpenAuth, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-panel" style={{ 
      position: 'sticky', 
      top: 16, 
      zIndex: 100, 
      margin: '12px auto 24px auto',
      maxWidth: '1240px',
      borderRadius: '16px',
      padding: '12px 24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('interview')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{ 
            width: 38, 
            height: 38, 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Interview<span style={{ 
                background: 'linear-gradient(to right, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>AI</span>
            </span>
            <span style={{ 
              fontSize: '0.65rem', 
              display: 'block', 
              color: 'var(--accent-cyan)',
              marginTop: -4,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Pro Prep Engine
            </span>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav style={{ display: 'none', md: 'flex', gap: 8 }} className="desktop-nav">
          <button 
            onClick={() => setActiveTab('interview')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'interview' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'interview' ? '#818cf8' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <PlayCircle size={17} />
            Mock Interview
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'history' ? '#818cf8' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <History size={17} />
            Past Sessions
          </button>

          <button 
            onClick={onOpenPricing}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <CreditCard size={17} />
            Pricing Plans
          </button>
        </nav>

        {/* Action Controls & User Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Live Credits Badge */}
          <div 
            onClick={onOpenPricing}
            title="Click to get more credits"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Zap size={16} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
              {user ? user.credits : 100}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>credits</span>
            <span style={{ 
              background: '#fbbf24', 
              color: '#000', 
              fontSize: '0.65rem', 
              fontWeight: 800, 
              padding: '1px 5px', 
              borderRadius: '4px',
              marginLeft: 2
            }}>
              + ADD
            </span>
          </div>

          {/* User Sign in / Profile */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '6px 12px'
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  maxWidth: '100px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="secondary-btn"
                style={{ padding: '7px 10px', borderRadius: '10px' }}
              >
                <LogOut size={16} color="var(--text-muted)" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="glow-btn"
              style={{ padding: '7px 16px', fontSize: '0.85rem' }}
            >
              <UserIcon size={15} />
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="secondary-btn mobile-menu-btn"
            style={{ padding: '8px', borderRadius: '10px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{ 
          marginTop: 16, 
          paddingTop: 16, 
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <button 
            onClick={() => { setActiveTab('interview'); setMobileMenuOpen(false); }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'interview' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: '#fff',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.95rem'
            }}
          >
            <PlayCircle size={18} color="#818cf8" />
            Mock Interview
          </button>

          <button 
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: '#fff',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.95rem'
            }}
          >
            <History size={18} color="#818cf8" />
            Past Sessions & Scorecards
          </button>

          <button 
            onClick={() => { onOpenPricing(); setMobileMenuOpen(false); }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#fff',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.95rem'
            }}
          >
            <CreditCard size={18} color="#fbbf24" />
            Pricing & Buy Credits
          </button>
        </div>
      )}
    </header>
  );
}
