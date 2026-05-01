import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ SupplierName: '', Phone: '', Email: '', Address: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch(`${API}/suppliers`).then(r => r.json()).then(d => { setSuppliers(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.SupplierName) return setMessage('Supplier name is required');
    const res = await fetch(`${API}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) { setForm({ SupplierName: '', Phone: '', Email: '', Address: '' }); setShowForm(false); load(); }
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading) return <div className="loading">Loading suppliers</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{suppliers.length} active suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Supplier'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Add New Supplier</div>
          <div className="form-row">
            <div className="form-group">
              <label>Supplier Name</label>
              <input value={form.SupplierName} onChange={e => setForm({ ...form, SupplierName: e.target.value })} placeholder="e.g. MedCorp Ltd" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="03001234567" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} placeholder="supplier@email.com" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input value={form.Address} onChange={e => setForm({ ...form, Address: e.target.value })} placeholder="City, Pakistan" />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Supplier</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">🏭 All Suppliers</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{suppliers.length} suppliers</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Supplier Name</th><th>Phone</th><th>Email</th><th>Address</th></tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.SupplierID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{s.SupplierID}</td>
                  <td style={{ fontWeight: 500 }}>{s.SupplierName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.Phone || '—'}</td>
                  <td style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{s.Email || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.Address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Suppliers;