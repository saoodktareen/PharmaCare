import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ CustomerName: '', Phone: '', Email: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch(`${API}/customers`).then(r => r.json()).then(d => { setCustomers(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.CustomerName) return setMessage('Customer name is required');
    const res = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) { setForm({ CustomerName: '', Phone: '', Email: '' }); setShowForm(false); load(); }
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading) return <div className="loading">Loading customers</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Customer'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Add New Customer</div>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input value={form.CustomerName} onChange={e => setForm({ ...form, CustomerName: e.target.value })} placeholder="e.g. Ahmed Khan" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="03001234567" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="customer@email.com" />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Customer</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">👤 All Customers</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customers.length} registered</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.CustomerID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{c.CustomerID}</td>
                  <td style={{ fontWeight: 500 }}>{c.CustomerName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.Phone || '—'}</td>
                  <td style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{c.Email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Customers;