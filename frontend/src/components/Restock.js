import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Restock({ user }) {
  const [restock, setRestock]       = useState([]);
  const [medicines, setMedicines]   = useState([]);
  const [form, setForm]             = useState({ MedicineID: '', ReorderQuantity: '' });
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState({ text: '', type: '' });
  const [showForm, setShowForm]     = useState(false);
  const [processing, setProcessing] = useState(new Set());

  const isAdmin = user?.Role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const [restockRes, medRes] = await Promise.all([
        fetch(`${API}/restock`),
        fetch(`${API}/medicines`),
      ]);
      const [restockData, medData] = await Promise.all([
        restockRes.json(),
        medRes.json(),
      ]);
      setRestock(restockData);
      setMedicines(medData);
    } catch {
      setMessage({ text: 'Failed to load data. Is the server running?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'error') => {
    setMessage({ text, type });
    if (type === 'success') setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async () => {
    if (!form.MedicineID || !form.ReorderQuantity) {
      return showMsg('Please fill all fields');
    }
    try {
      const res  = await fetch(`${API}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      showMsg(data.message || data.error, res.ok ? 'success' : 'error');
      if (res.ok) {
        setForm({ MedicineID: '', ReorderQuantity: '' });
        setShowForm(false);
        await load();
      }
    } catch {
      showMsg('Server error. Please try again.');
    }
  };

  const handleApprove = async (id) => {
    setProcessing(prev => new Set([...prev, id]));
    try {
      const res  = await fetch(`${API}/restock/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.Role || 'staff',
        },
      });
      const data = await res.json();
      if (res.ok) {
        await load();
        showMsg('Restock approved — stock has been updated', 'success');
      } else {
        showMsg(data.error || 'Failed to approve restock');
        setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
      }
    } catch {
      showMsg('Server error. Please try again.');
      setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleCancel = async (id) => {
    setProcessing(prev => new Set([...prev, id]));
    try {
      const res  = await fetch(`${API}/restock/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user?.Role || 'staff',
        },
      });
      const data = await res.json();
      if (res.ok) {
        await load();
        showMsg('Restock order cancelled', 'success');
      } else {
        showMsg(data.error || 'Failed to cancel restock');
        setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
      }
    } catch {
      showMsg('Server error. Please try again.');
      setProcessing(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'PENDING':  return { label: 'Pending',   className: 'badge-pending'  };
      case 'RECEIVED': return { label: 'Received',  className: 'badge-received' };
      case 'ORDERED':  return { label: 'Cancelled', className: 'badge-low'      };
      default:         return { label: status,      className: 'badge-ordered'  };
    }
  };

  if (loading) return <div className="loading">Loading restock data</div>;

  const pending   = restock.filter(r => r.Status === 'PENDING').length;
  const approved  = restock.filter(r => r.Status === 'RECEIVED').length;
  const cancelled = restock.filter(r => r.Status === 'ORDERED').length;

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

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card amber">
          <span className="stat-icon">⏳</span>
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card green">
          <span className="stat-icon">✅</span>
          <div className="stat-value">{approved}</div>
          <div className="stat-label">Received</div>
        </div>
        <div className="stat-card red">
          <span className="stat-icon">✕</span>
          <div className="stat-value">{cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {message.text && (
        <div
          className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
        >
          <span>{message.type === 'success' ? '✅' : '❌'} {message.text}</span>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', marginLeft: 12 }}
          >
            ✕
          </button>
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
            <button className="btn btn-primary" onClick={handleSubmit}>
              Create Order
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">📦 All Restock Orders</span>
          {isAdmin && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Approve to receive stock · Cancel to reject
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
              {restock.map(r => {
                const { label, className } = statusBadge(r.Status);
                const isProcessing = processing.has(r.ReorderID);

                return (
                  <tr key={r.ReorderID}>
                    <td style={{ color: 'var(--text-muted)' }}>#{r.ReorderID}</td>
                    <td style={{ fontWeight: 500 }}>{r.MedicineName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.SupplierName || '—'}</td>
                    <td>{r.ReorderQuantity}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(r.ReorderDate).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <span className={`badge ${className}`}>{label}</span>
                    </td>
                    {isAdmin && (
                      <td>
                        {isProcessing ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            Updating…
                          </span>
                        ) : r.Status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApprove(r.ReorderID)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(r.ReorderID)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : r.Status === 'RECEIVED' ? (
                          <span style={{ color: 'var(--green)', fontSize: '0.78rem' }}>
                            Stock updated ✓
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {restock.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                    No restock orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Restock;
