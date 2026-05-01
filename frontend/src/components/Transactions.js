import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/transactions`)
      .then(r => r.json())
      .then(d => { setTransactions(d); setLoading(false); })
      .catch(() => { setError('Could not load transactions'); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">Loading transactions</div>;
  if (error)   return <div className="alert alert-error">⚠️ {error}</div>;

  const incoming = transactions.filter(t => t.TransactionType === 'IN').length;
  const outgoing = transactions.filter(t => t.TransactionType === 'OUT').length;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Transactions</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>Full stock movement history</p>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card blue">
          <span className="stat-icon">📋</span>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
        <div className="stat-card green">
          <span className="stat-icon">📥</span>
          <div className="stat-value">{incoming}</div>
          <div className="stat-label">Stock In</div>
        </div>
        <div className="stat-card red">
          <span className="stat-icon">📤</span>
          <div className="stat-value">{outgoing}</div>
          <div className="stat-label">Stock Out</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">📋 Transaction History</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Medicine</th><th>Type</th>
                <th>Quantity</th><th>Date</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No transactions recorded yet
                  </td>
                </tr>
              ) : transactions.map(t => (
                <tr key={t.TransactionID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{t.TransactionID}</td>
                  <td style={{ fontWeight: 500 }}>{t.MedicineName}</td>
                  <td>
                    <span className={`badge ${t.TransactionType === 'IN' ? 'badge-received' : 'badge-low'}`}>
                      {t.TransactionType === 'IN' ? '📥 IN' : '📤 OUT'}
                    </span>
                  </td>
                  <td>{t.Quantity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(t.TransactionDate).toLocaleDateString('en-GB')}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{t.Notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;