import React, { useState } from 'react';

const API = 'http://localhost:5000/api';

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
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
        // After signup, auto switch to login
        setMode('login');
        setForm(f => ({ ...f, FullName: '', Password: '' }));
        setError('');
        alert('Account created! Please log in.');
      } else {
        // Store user in localStorage so they stay logged in on refresh
        localStorage.setItem('pharmacare_user', JSON.stringify(data.user));
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
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Glowing orb */}
      <div style={styles.orb} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>💊</div>
          <div>
            <div style={styles.logoName}>PharmaCare</div>
            <div style={styles.logoSub}>Inventory Management System</div>
          </div>
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

        {/* Form */}
        <div style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>FULL NAME</label>
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
            <label style={styles.label}>EMAIL</label>
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
            <label style={styles.label}>PASSWORD</label>
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
              <label style={styles.label}>ROLE</label>
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
            style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          {mode === 'login' && (
            <div style={styles.hint}>
              <span style={{ color: '#3d5068' }}>Default admin: </span>
              <span style={{ color: '#00d4ff', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                admin@pharmacare.com / admin123
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#090b10',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
  },
  grid: {
    position: 'fixed', inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    top: '-100px', left: '50%',
    transform: 'translateX(-50%)',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: '#0f1218',
    border: '1px solid #1e2838',
    borderRadius: '20px',
    padding: '40px',
    width: '100%', maxWidth: '420px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '46px', height: '46px',
    background: 'rgba(0,212,255,0.1)',
    border: '1px solid rgba(0,212,255,0.3)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px',
    boxShadow: '0 0 16px rgba(0,212,255,0.2)',
  },
  logoName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '1.2rem', fontWeight: 800,
    color: '#e8edf5', letterSpacing: '-0.02em',
  },
  logoSub: {
    fontSize: '0.72rem', color: '#3d5068',
    letterSpacing: '0.04em', marginTop: '2px',
  },
  tabs: {
    display: 'flex',
    background: '#141920',
    borderRadius: '8px',
    padding: '4px',
    marginBottom: '28px',
    border: '1px solid #1e2838',
  },
  tab: {
    flex: 1, padding: '9px',
    border: 'none', borderRadius: '6px',
    background: 'none', color: '#3d5068',
    cursor: 'pointer', fontFamily: "'Syne', sans-serif",
    fontSize: '0.82rem', fontWeight: 700,
    letterSpacing: '0.03em', transition: 'all 0.2s',
  },
  tabActive: {
    background: '#1a2230',
    color: '#00d4ff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '0.68rem', fontWeight: 700,
    color: '#3d5068', letterSpacing: '0.1em',
    fontFamily: "'Syne', sans-serif",
  },
  input: {
    padding: '11px 14px',
    background: '#141920',
    border: '1px solid #1e2838',
    borderRadius: '8px',
    color: '#e8edf5',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border 0.2s',
    width: '100%',
  },
  errorBox: {
    background: 'rgba(255,77,106,0.1)',
    border: '1px solid rgba(255,77,106,0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ff4d6a',
    fontSize: '0.83rem',
  },
  submitBtn: {
    padding: '13px',
    background: '#00d4ff',
    border: 'none', borderRadius: '8px',
    color: '#000',
    fontFamily: "'Syne', sans-serif",
    fontSize: '0.88rem', fontWeight: 800,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
    transition: 'all 0.2s',
    marginTop: '4px',
  },
  hint: {
    textAlign: 'center', fontSize: '0.8rem',
    marginTop: '4px',
  },
};

export default AuthPage;