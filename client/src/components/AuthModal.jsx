import React, { useState } from 'react';
import { X, Sparkles, LogIn, Mail, User, Lock, ShieldCheck } from 'lucide-react';
import { auth, googleProvider } from '../config/firebase.js';
import { signInWithPopup } from 'firebase/auth';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, apiUrl }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFirebaseGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Sync with backend
      const res = await fetch(`${apiUrl}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email.split('@')[0]
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('interviewai_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to sync with backend');
      }
    } catch (err) {
      console.warn('Firebase Google Auth popup error, falling back to instant email signin:', err);
      // If Firebase popup was blocked or domain not allowed, provide helpful fallback
      setErrorMsg('Google Sign-In notice: You can also sign in directly with email below.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${apiUrl}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || email.split('@')[0]
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('interviewai_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Authentication error');
      }
    } catch (err) {
      setErrorMsg('Server connection failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div className="glass-panel" style={{
        maxWidth: 440,
        width: '100%',
        padding: '32px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            {isRegister ? 'Create InterviewAI Account' : 'Welcome to InterviewAI'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Get 100 free AI interview credits upon sign in
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: '#fb7185',
            marginBottom: 16
          }}>
            {errorMsg}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleFirebaseGoogleLogin}
          disabled={loading}
          className="secondary-btn"
          style={{ width: '100%', padding: '11px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: 16 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OR WITH EMAIL</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Siddharth"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn"
            style={{ width: '100%', padding: '11px', borderRadius: '8px', fontSize: '0.95rem' }}
          >
            {loading ? 'Signing in...' : isRegister ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up Free"}
          </button>
        </div>

      </div>
    </div>
  );
}
