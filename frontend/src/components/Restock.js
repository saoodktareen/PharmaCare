import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Restock() {
  const [restock, setRestock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ MedicineID: '', ReorderQuantity: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/restock`).then(r => r.json()),
      fetch(`${API}/medicines`).then(r => r.json()),
    ]).then(([r, m]) => { setRestock(r); setMedicines(m); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };

  // ── Add restock order ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.MedicineID || !form.ReorderQuantity) return showMsg('Please fill all fields');
    const res = await fetch(`${API}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    if (res.ok) { setForm({ MedicineID: '', ReorderQuantity: '' }); setShowForm(false); load(); }
  };

  // ── Update restock status ─────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    const res = await fetch(`${API}/restock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: newStatus })
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    load();
  };

  const badgeClass = s =>
    s === 'PENDING' ? 'badge-pending' : s === 'ORDERED' ? 'badge-ordered' : 'badge-received';

  // Next status in the workflow
  const nextStatus = s =>
    s === 'PENDING' ? 'ORDERED' : s === 'ORDERED' ? 'RECEIVED' : null;

  if (loading) return <div className="loading">Loading restock data</div>;

  const pending  = restock.filter(r => r.Status === 'PENDING').length;
  const ordered  = restock.filter(r => r.Status === 'ORDERED').length;
  const received = restock.filter(r => r.Status === 'RECEIVED').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Restock Orders</h1>
          <p className="page-subtitle">Manage medicine reorder requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Restock Order'}
        </button>
      </div>

      {/* Status summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card amber">
          <span className="stat-icon">⏳</span>
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">🚚</span>
          <div className="stat-value">{ordered}</div>
          <div className="stat-label">Ordered</div>
        </div>
        <div className="stat-card green">
          <span className="stat-icon">✅</span>
          <div className="stat-value">{received}</div>
          <div className="stat-label">Received</div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Create Restock Order</div>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine</label>
              <select value={form.MedicineID} onChange={e => setForm({ ...form, MedicineID: e.target.value })}>
                <option value="">Select Medicine</option>
                {medicines.map(m => (
                  <option key={m.MedicineID} value={m.MedicineID}>
                    {m.MedicineName} (Stock: {m.StockLevel})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Reorder Quantity</label>
              <input
                type="number" min="1"
                value={form.ReorderQuantity}
                onChange={e => setForm({ ...form, ReorderQuantity: e.target.value })}
                placeholder="e.g. 100"
              />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Create Order</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">📦 All Restock Orders</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click "Advance" to move order through workflow
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Medicine</th><th>Reorder Qty</th>
                <th>Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {restock.map(r => (
                <tr key={r.ReorderID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{r.ReorderID}</td>
                  <td style={{ fontWeight: 500 }}>{r.MedicineName}</td>
                  <td>{r.ReorderQuantity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(r.ReorderDate).toLocaleDateString('en-GB')}
                  </td>
                  <td><span className={`badge ${badgeClass(r.Status)}`}>{r.Status}</span></td>
                  <td>
                    {nextStatus(r.Status) ? (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleStatusChange(r.ReorderID, nextStatus(r.Status))}
                      >
                        → Mark {nextStatus(r.Status)}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Restock;