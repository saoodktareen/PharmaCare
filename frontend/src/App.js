import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import Dashboard from './components/Dashboard';
import Medicines from './components/Medicines';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Restock from './components/Restock';
import Transactions from './components/Transactions';
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
  { id: 'users',        label: 'Manage Users', icon: '👥', roles: ['admin'] },
];

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const navItems = allNavItems.filter(item => item.roles.includes(user?.Role));
  useEffect(() => {
    const saved = localStorage.getItem('pharmacare_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin  = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem('pharmacare_user');
    setUser(null);
    setActivePage('dashboard');
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

 const renderPage = () => {
  const role = user?.Role;

  // Staff trying to access admin-only page — redirect
  const adminOnly = ['suppliers', 'transactions', 'users'];
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
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.8rem', color: '#e8edf5', fontWeight: 600 }}>
              {user.FullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#3d5068', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {user.Role}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px',
            background: 'rgba(255,77,106,0.1)',
            border: '1px solid rgba(255,77,106,0.2)',
            borderRadius: '6px', color: '#ff4d6a', cursor: 'pointer',
            fontFamily: "'Syne', sans-serif", fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Sign Out
          </button>
          <div className="status-dot" style={{ marginTop: '10px' }}>Connected</div>
        </div>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;