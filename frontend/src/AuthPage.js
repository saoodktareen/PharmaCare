import React, { useState } from 'react';

const API = 'http://localhost:5000/api';

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ FullName: '', Email: '', Password: '', Role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.Email || !form.Password) return setError('Email and password are required');
    if (mode === 'signup' && !form.FullName) return setError('Full name is required');

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong');

      if (mode === 'signup') {
        setMode('login');
        setForm(f => ({ ...f, FullName: '', Password: '' }));
        setError('');
        alert('Account created! Please log in.');
      } else {
        sessionStorage.setItem('pharmacare_user', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch {
      setError('Cannot connect to server. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={styles.page}>

      {/* Left panel — branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.brandIcon}>💊</div>
          <h1 style={styles.brandName}>PharmaCare</h1>
          <p style={styles.brandTagline}>Inventory Management System</p>
          <div style={styles.featureList}>
            {[
              '🏥 Real-time stock tracking',
              '📊 Sales & revenue reports',
              '🔔 Low stock alerts',
              '👥 Role-based access control',
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>
        <div style={styles.leftFooter}>
          Trusted pharmacy management — secure, reliable, fast.
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>

          {/* Header */}
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={styles.cardSub}>
              {mode === 'login'
                ? 'Sign in to your PharmaCare account'
                : 'Register a new account to get started'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Register
            </button>
          </div>

          {/* Form fields */}
          <div style={styles.form}>
            {mode === 'signup' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  placeholder="John Doe"
                  value={form.FullName}
                  onChange={e => update('FullName', e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={form.Email}
                onChange={e => update('Email', e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={form.Password}
                onChange={e => update('Password', e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            {mode === 'signup' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.input}
                  value={form.Role}
                  onChange={e => update('Role', e.target.value)}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                ⚠️ {error}
              </div>
            )}

            <button
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? '⏳ Please wait...'
                : mode === 'login'
                  ? 'Sign In →'
                  : 'Create Account →'}
            </button>

            {mode === 'login' && (
              <div style={styles.hint}>
                <span style={{ color: '#94a3b8' }}>Default admin: </span>
                <span style={{ color: '#0ea5e9', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  admin@pharmacare.com / admin123
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: '#f0f4f8',
  },

  // ── Left branding panel ──
  leftPanel: {
    flex: '1',
    background: 'linear-gradient(160deg, #0a2540 0%, #0d3460 60%, #1a4f8a 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '60px 56px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    position: 'relative', zIndex: 1,
  },
  brandIcon: {
    width: '64px', height: '64px',
    background: 'rgba(14,165,233,0.15)',
    border: '1px solid rgba(14,165,233,0.3)',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '30px',
    marginBottom: '28px',
    boxShadow: '0 8px 24px rgba(14,165,233,0.2)',
  },
  brandName: {
    fontSize: '2.4rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.03em',
    marginBottom: '8px',
    lineHeight: 1,
  },
  brandTagline: {
    fontSize: '0.95rem',
    color: 'rgba(148,163,184,0.8)',
    marginBottom: '48px',
    fontWeight: 400,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    fontSize: '0.9rem',
    color: 'rgba(226,232,240,0.85)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 500,
  },
  leftFooter: {
    fontSize: '0.78rem',
    color: 'rgba(148,163,184,0.5)',
    position: 'relative', zIndex: 1,
  },

  // ── Right form panel ──
  rightPanel: {
    width: '480px',
    minWidth: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
    background: '#f0f4f8',
  },
  card: {
    width: '100%',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
  },
  cardSub: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 400,
  },

  // ── Tabs ──
  tabs: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  },
  tab: {
    flex: 1,
    padding: '9px',
    border: 'none',
    borderRadius: '7px',
    background: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#ffffff',
    color: '#0ea5e9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },

  // ── Form ──
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '11px 14px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    color: '#0f172a',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border 0.2s',
    width: '100%',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#991b1b',
    fontSize: '0.83rem',
    fontWeight: 500,
  },
  submitBtn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
    transition: 'all 0.2s',
    marginTop: '4px',
    letterSpacing: '0.01em',
  },
  hint: {
    textAlign: 'center',
    fontSize: '0.78rem',
    marginTop: '4px',
  },
};

export default AuthPage;