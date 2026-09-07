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
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ 
  user, 
  activeTab, 
  setActiveTab, 
  onOpenPricing, 
  onOpenAuth, 
  onLogout 
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('interview')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '12px', 
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
              WebkitTextFillColor: 'transparent',
              display: 'block',
              lineHeight: 1.2
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
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Pro Prep Engine
            </span>
          </div>
        </div>

        {/* Right Controls: Token Badge + Sign In + Burger Menu */}
        <div className="navbar-right-controls">
          
          {/* Clean Token Pill Badge */}
          <div 
            onClick={onOpenPricing}
            title="Available Tokens • Click to buy more"
            className="token-badge-pill"
          >
            <Coins size={17} color="#fbbf24" />
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem' }}>
              {user ? user.credits : 100}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Tokens</span>
          </div>

          {/* User Sign in / Profile */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="user-profile-chip">
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-profile-name">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="secondary-btn"
                style={{ padding: '7px 9px', borderRadius: '10px' }}
              >
                <LogOut size={15} color="var(--text-muted)" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="glow-btn"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <UserIcon size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Burger Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="secondary-btn"
            style={{ 
              padding: '9px 12px', 
              borderRadius: '12px',
              border: menuOpen ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
              background: menuOpen ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
            title="Open Navigation Menu"
          >
            {menuOpen ? <X size={20} color="#818cf8" /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Slide-Down Navigation Menu Drawer */}
      {menuOpen && (
        <div style={{ 
          marginTop: 14, 
          paddingTop: 14, 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <button 
            onClick={() => { setActiveTab('interview'); setMenuOpen(false); }}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'interview' ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
              color: activeTab === 'interview' ? '#a5b4fc' : '#fff',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PlayCircle size={18} color="#818cf8" />
              <span>Mock Interview</span>
            </div>
            <ChevronRight size={16} color="var(--text-dim)" />
          </button>

          <button 
            onClick={() => { setActiveTab('history'); setMenuOpen(false); }}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
              color: activeTab === 'history' ? '#a5b4fc' : '#fff',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <History size={18} color="#06b6d4" />
              <span>Past Sessions & Scorecards</span>
            </div>
            <ChevronRight size={16} color="var(--text-dim)" />
          </button>

          <button 
            onClick={() => { onOpenPricing(); setMenuOpen(false); }}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#fff',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.92rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={18} color="#fbbf24" />
              <span>Pricing Plans & Buy Tokens</span>
            </div>
            <ChevronRight size={16} color="var(--text-dim)" />
          </button>
        </div>
      )}
    </header>
  );
}

