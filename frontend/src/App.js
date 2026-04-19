import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Medicines from './components/Medicines';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Restock from './components/Restock';
import './App.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
  { id: 'medicines', label: 'Medicines',  icon: '💊' },
  { id: 'sales',     label: 'Sales',      icon: '🛒' },
  { id: 'customers', label: 'Customers',  icon: '👤' },
  { id: 'suppliers', label: 'Suppliers',  icon: '🏭' },
  { id: 'restock',   label: 'Restock',    icon: '📦' },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'medicines': return <Medicines />;
      case 'sales':     return <Sales />;
      case 'customers': return <Customers />;
      case 'suppliers': return <Suppliers />;
      case 'restock':   return <Restock />;
      default:          return <Dashboard />;
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
          <div className="status-dot">Backend connected</div>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;