import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import Dashboard from './components/Dashboard';
import Medicines from './components/Medicines';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Restock from './components/Restock';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import './App.css';
import UsersAdmin from './components/UsersAdmin';

const allNavItems = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '📊', roles: ['admin', 'staff'] },
  { id: 'medicines',    label: 'Medicines',    icon: '💊', roles: ['admin', 'staff'] },
  { id: 'sales',        label: 'Sales',        icon: '🛒', roles: ['admin', 'staff'] },
  { id: 'customers',    label: 'Customers',    icon: '👤', roles: ['admin', 'staff'] },
  { id: 'suppliers',    label: 'Suppliers',    icon: '🏭', roles: ['admin'] },
  { id: 'restock',      label: 'Restock',      icon: '📦', roles: ['admin', 'staff'] },
  { id: 'transactions', label: 'Transactions', icon: '📋', roles: ['admin'] },
  { id: 'reports',      label: 'Reports',      icon: '📈', roles: ['admin'] },
  { id: 'users',        label: 'Manage Users', icon: '👥', roles: ['admin'] },
];

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const navItems = allNavItems.filter(item => item.roles.includes(user?.Role));

  useEffect(() => {
    const saved = sessionStorage.getItem('pharmacare_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    sessionStorage.setItem('pharmacare_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pharmacare_user');
    setUser(null);
    setActivePage('dashboard');
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  const renderPage = () => {
    const role = user?.Role;
    const adminOnly = ['suppliers', 'transactions', 'users', 'reports'];
    if (role !== 'admin' && adminOnly.includes(activePage)) {
      return <Dashboard user={user} />;
    }
    switch (activePage) {
      case 'dashboard':    return <Dashboard user={user} />;
      case 'medicines':    return <Medicines user={user} />;
      case 'sales':        return <Sales user={user} />;
      case 'customers':    return <Customers user={user} />;
      case 'suppliers':    return <Suppliers user={user} />;
      case 'restock':      return <Restock user={user} />;
      case 'transactions': return <Transactions user={user} />;
      case 'reports':      return <Reports user={user} />;
      case 'users':        return <UsersAdmin user={user} />;
      default:             return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">💊</div>
            <h2>PharmaCare</h2>
          </div>
          <p>Inventory System</p>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Menu</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User info */}
          <div style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 10
          }}>
            <div style={{ fontSize: '0.82rem', color: '#e8edf5', fontWeight: 600, marginBottom: 2 }}>
              {user.FullName}
            </div>
            <div style={{
              fontSize: '0.65rem', color: '#00d4ff',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              fontWeight: 700
            }}>
              {user.Role === 'admin' ? '🛡️ Administrator' : '👤 Staff'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#3d5068', marginTop: 2 }}>
              {user.Email}
            </div>
          </div>

          {/* Logout button — clearly visible */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,77,106,0.12)',
              border: '1px solid rgba(255,77,106,0.35)',
              borderRadius: 8,
              color: '#ff4d6a',
              cursor: 'pointer',
              fontFamily: "'Syne', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,77,106,0.22)';
              e.currentTarget.style.borderColor = 'rgba(255,77,106,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,77,106,0.12)';
              e.currentTarget.style.borderColor = 'rgba(255,77,106,0.35)';
            }}
          >
            🚪 Sign Out
          </button>

          <div className="status-dot" style={{ marginTop: 10 }}>Connected</div>
        </div>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
