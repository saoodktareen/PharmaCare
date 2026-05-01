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

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '📊' },
  { id: 'medicines',    label: 'Medicines',    icon: '💊' },
  { id: 'sales',        label: 'Sales',        icon: '🛒' },
  { id: 'customers',    label: 'Customers',    icon: '👤' },
  { id: 'suppliers',    label: 'Suppliers',    icon: '🏭' },
  { id: 'restock',      label: 'Restock',      icon: '📦' },
  { id: 'transactions', label: 'Transactions', icon: '📋' },
];

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

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
    switch (activePage) {
      case 'dashboard':    return <Dashboard />;
      case 'medicines':    return <Medicines />;
      case 'sales':        return <Sales />;
      case 'customers':    return <Customers />;
      case 'suppliers':    return <Suppliers />;
      case 'restock':      return <Restock />;
      case 'transactions': return <Transactions />;
      default:             return <Dashboard />;
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