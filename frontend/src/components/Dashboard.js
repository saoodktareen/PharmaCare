import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => setError('Could not connect to backend. Is your server running on port 5000?'));
    fetch(`${API}/medicines/low-stock`)
      .then(r => r.json())
      .then(setLowStock)
      .catch(() => {});
  }, []);

  if (error) return <div className="alert alert-error">⚠️ {error}</div>;
  if (!stats) return <div className="loading">Loading dashboard</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Pharmacy Inventory Overview</p>

      <div className="stats-grid" style={{ marginTop: 24 }}>
        <div className="stat-card blue">
          <span className="stat-icon">💊</span>
          <div className="stat-value">{stats.totalMedicines}</div>
          <div className="stat-label">Total Medicines</div>
        </div>
        <div className="stat-card green">
          <span className="stat-icon">🛒</span>
          <div className="stat-value">{stats.totalSales}</div>
          <div className="stat-label">Total Sales</div>
        </div>
        <div className="stat-card green">
          <span className="stat-icon">💰</span>
          <div className="stat-value">Rs {Number(stats.totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card red">
          <span className="stat-icon">⚠️</span>
          <div className="stat-value">{stats.lowStockCount}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        <div className="stat-card amber">
          <span className="stat-icon">📦</span>
          <div className="stat-value">{stats.pendingRestock}</div>
          <div className="stat-label">Pending Restocks</div>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">👤</span>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card amber">
          <span className="stat-icon">🏭</span>
          <div className="stat-value">{stats.totalSuppliers}</div>
          <div className="stat-label">Total Suppliers</div>
        </div>
      </div>

      {lowStock.length > 0 ? (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">⚠️ Low Stock Alerts</span>
            <span className="badge badge-low">{lowStock.length} items</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Current Stock</th>
                  <th>Minimum Required</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((m, i) => (
                  <tr key={i}>
                    <td>{m.MedicineName}</td>
                    <td>{m.StockLevel}</td>
                    <td>{m.MinimumStockLevel}</td>
                    <td><span className="badge badge-low">Low Stock</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">✅ Stock Status</span>
          </div>
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--green)', fontSize: '0.9rem' }}>
            All medicines are above minimum stock levels
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;