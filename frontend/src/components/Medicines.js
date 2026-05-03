import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';
const emptyForm = {
  MedicineName: '', CategoryID: '', SupplierID: '', BatchNumber: '',
  ExpiryDate: '', Price: '', StockLevel: '', MinimumStockLevel: '10'
};

function Medicines({ user }) {
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingID, setEditingID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expiryAlerts, setExpiryAlerts] = useState([]);

  const isAdmin = user?.Role === 'admin';

  // Build auth headers — backend requireAdmin checks x-user-role
  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': user?.Role || 'staff'
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/medicines`).then(r => r.json()),
      fetch(`${API}/categories`).then(r => r.json()),
      fetch(`${API}/suppliers`).then(r => r.json()),
      fetch(`${API}/medicines/expiring-soon`, { headers: authHeaders }).then(r => r.json()),
    ]).then(([meds, cats, sups, alerts]) => {
      setMedicines(meds);
      setFiltered(meds);
      setCategories(cats);
      setSuppliers(sups);
      setExpiryAlerts(Array.isArray(alerts) ? alerts : []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  // Live search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(medicines);
    } else {
      const q = search.toLowerCase();
      setFiltered(medicines.filter(m =>
        m.MedicineName?.toLowerCase().includes(q) ||
        m.CategoryName?.toLowerCase().includes(q) ||
        m.SupplierName?.toLowerCase().includes(q) ||
        m.BatchNumber?.toLowerCase().includes(q)
      ));
    }
  }, [search, medicines]);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleAdd = async () => {
    const res = await fetch(`${API}/medicines`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    if (res.ok) { setForm(emptyForm); setShowForm(false); load(); }
  };

  const startEdit = (m) => {
    setEditingID(m.MedicineID);
    setForm({
      MedicineName: m.MedicineName,
      CategoryID: m.CategoryID || '',
      SupplierID: m.SupplierID || '',
      BatchNumber: m.BatchNumber || '',
      ExpiryDate: m.ExpiryDate ? m.ExpiryDate.split('T')[0] : '',
      Price: m.Price,
      StockLevel: m.StockLevel,
      MinimumStockLevel: m.MinimumStockLevel
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = async () => {
    const res = await fetch(`${API}/medicines/${editingID}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(form)
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    if (res.ok) { setForm(emptyForm); setEditingID(null); setShowForm(false); load(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    const res = await fetch(`${API}/medicines/${id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const data = await res.json();
    showMsg(data.message || data.error);
    load();
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingID(null);
    setForm(emptyForm);
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  const daysUntilExpiry = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="loading">Loading medicines</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-subtitle">{medicines.length} medicines in inventory</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { cancelForm(); setShowForm(s => !s); }}>
            {showForm && !editingID ? '✕ Cancel' : '+ Add Medicine'}
          </button>
        )}
      </div>

      {/* ── Expiry Alerts ── */}
      {expiryAlerts.length > 0 && (
        <div className="panel" style={{ marginBottom: 20, border: '1px solid rgba(255,165,0,0.3)', background: 'rgba(255,165,0,0.05)' }}>
          <div className="panel-header">
            <span className="panel-title">🕐 Expiring Within 30 Days</span>
            <span className="badge badge-low">{expiryAlerts.length} items</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Medicine</th><th>Expiry Date</th><th>Days Left</th><th>Stock</th></tr>
              </thead>
              <tbody>
                {expiryAlerts.map((m, i) => {
                  const days = daysUntilExpiry(m.ExpiryDate);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{m.MedicineName}</td>
                      <td>{formatDate(m.ExpiryDate)}</td>
                      <td>
                        <span style={{ color: days <= 7 ? 'var(--red, #ff4d6a)' : 'var(--amber, #f59e0b)', fontWeight: 600 }}>
                          {days} days
                        </span>
                      </td>
                      <td>{m.StockLevel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {/* ── Add / Edit Form ── */}
      {showForm && isAdmin && (
        <div className="form-panel">
          <div className="form-panel-title">
            {editingID ? `✏️ Editing Medicine #${editingID}` : '➕ Add New Medicine'}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine Name</label>
              <input value={form.MedicineName} onChange={e => setForm({ ...form, MedicineName: e.target.value })} placeholder="e.g. Amoxicillin" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.CategoryID} onChange={e => setForm({ ...form, CategoryID: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select value={form.SupplierID} onChange={e => setForm({ ...form, SupplierID: e.target.value })}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Batch Number</label>
              <input value={form.BatchNumber} onChange={e => setForm({ ...form, BatchNumber: e.target.value })} placeholder="BATCH-X001" />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={form.ExpiryDate} onChange={e => setForm({ ...form, ExpiryDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Price (Rs)</label>
              <input type="number" value={form.Price} onChange={e => setForm({ ...form, Price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Stock Level</label>
              <input type="number" value={form.StockLevel} onChange={e => setForm({ ...form, StockLevel: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Min Stock Level</label>
              <input type="number" value={form.MinimumStockLevel} onChange={e => setForm({ ...form, MinimumStockLevel: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={editingID ? handleEdit : handleAdd}>
              {editingID ? '💾 Save Changes' : '➕ Add Medicine'}
            </button>
            <button className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: 16 }}>
        <input
          style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--bg-secondary, #141920)',
            border: '1px solid var(--border, #1e2838)',
            borderRadius: 8, color: 'var(--text-primary, #e8edf5)',
            fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none'
          }}
          placeholder="🔍 Search medicines by name, category, supplier, batch..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">💊 All Medicines</span>
          {search && <span className="badge badge-pending">{filtered.length} results</span>}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Medicine</th><th>Category</th><th>Supplier</th>
                <th>Batch</th><th>Expiry</th><th>Price</th><th>Stock</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.MedicineID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{m.MedicineID}</td>
                  <td style={{ fontWeight: 500 }}>{m.MedicineName}</td>
                  <td>{m.CategoryName}</td>
                  <td>{m.SupplierName}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{m.BatchNumber}</td>
                  <td>{formatDate(m.ExpiryDate)}</td>
                  <td style={{ color: 'var(--green)' }}>Rs {m.Price}</td>
                  <td>
                    {m.StockLevel < m.MinimumStockLevel
                      ? <span className="badge badge-low">{m.StockLevel}</span>
                      : <span style={{ color: 'var(--green)' }}>{m.StockLevel}</span>}
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(m)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.MedicineID)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No medicines found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Medicines;
