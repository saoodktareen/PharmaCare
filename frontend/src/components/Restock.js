import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Restock({ user }) {
  const [restock, setRestock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ MedicineID: '', ReorderQuantity: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isAdmin = user?.Role === 'admin';

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

  // ── Approve restock (admin only) ──────────────────────────
  const handleApprove = async (id) => {
    if (!window.confirm('Approve this restock order? Stock will be updated.')) return;
    const res = await fetch(`${API}/restock/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': user?.Role || 'staff'
      }
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    load();
  };

  // ── Cancel restock (admin only) ───────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this restock order?')) return;
    const res = await fetch(`${API}/restock/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': user?.Role || 'staff'
      }
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    load();
  };

  const badgeClass = s =>
    s === 'PENDING'   ? 'badge-pending'  :
    s === 'APPROVED'  ? 'badge-received' :
    s === 'CANCELLED' ? 'badge-low'      : 'badge-ordered';

  if (loading) return <div className="loading">Loading restock data</div>;

  const pending   = restock.filter(r => r.Status === 'PENDING').length;
  const approved  = restock.filter(r => r.Status === 'APPROVED').length;
  const cancelled = restock.filter(r => r.Status === 'CANCELLED').length;

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
        <div className="stat-card green">
          <span className="stat-icon">✅</span>
          <div className="stat-value">{approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card red">
          <span className="stat-icon">✕</span>
          <div className="stat-value">{cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') || message.includes('approved') || message.includes('cancelled') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('error') || message.includes('Cannot') ? '❌' : '✅'} {message}
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
          {isAdmin && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Approve to update stock · Cancel to reject
            </span>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Medicine</th>
                <th>Supplier</th>
                <th>Reorder Qty</th>
                <th>Date</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {restock.map(r => (
                <tr key={r.ReorderID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{r.ReorderID}</td>
                  <td style={{ fontWeight: 500 }}>{r.MedicineName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.SupplierName || '—'}</td>
                  <td>{r.ReorderQuantity}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(r.ReorderDate).toLocaleDateString('en-GB')}
                  </td>
                  <td>
                    <span className={`badge ${badgeClass(r.Status)}`}>{r.Status}</span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {r.Status === 'PENDING' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApprove(r.ReorderID)}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(r.ReorderID)}
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        {r.Status === 'APPROVED' && (
                          <span style={{ color: 'var(--green)', fontSize: '0.78rem' }}>
                            Stock updated ✓
                          </span>
                        )}
                        {r.Status === 'CANCELLED' && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  )}
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