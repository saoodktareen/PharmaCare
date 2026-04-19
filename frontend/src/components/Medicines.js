import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';
const emptyForm = { MedicineName:'', CategoryID:'', SupplierID:'', BatchNumber:'', ExpiryDate:'', Price:'', StockLevel:'', MinimumStockLevel:'10' };

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/medicines`).then(r => r.json()),
      fetch(`${API}/categories`).then(r => r.json()),
      fetch(`${API}/suppliers`).then(r => r.json()),
    ]).then(([meds, cats, sups]) => {
      setMedicines(meds); setCategories(cats); setSuppliers(sups); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    const res = await fetch(`${API}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) { setForm(emptyForm); setShowForm(false); load(); }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    const res = await fetch(`${API}/medicines/${id}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(data.message || data.error);
    load();
    setTimeout(() => setMessage(''), 4000);
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  if (loading) return <div className="loading">Loading medicines</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-subtitle">{medicines.length} medicines in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Add New Medicine</div>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine Name</label>
              <input value={form.MedicineName} onChange={e => setForm({...form, MedicineName: e.target.value})} placeholder="e.g. Amoxicillin" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.CategoryID} onChange={e => setForm({...form, CategoryID: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select value={form.SupplierID} onChange={e => setForm({...form, SupplierID: e.target.value})}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Batch Number</label>
              <input value={form.BatchNumber} onChange={e => setForm({...form, BatchNumber: e.target.value})} placeholder="BATCH-X001" />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={form.ExpiryDate} onChange={e => setForm({...form, ExpiryDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Price (Rs)</label>
              <input type="number" value={form.Price} onChange={e => setForm({...form, Price: e.target.value})} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Stock Level</label>
              <input type="number" value={form.StockLevel} onChange={e => setForm({...form, StockLevel: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Min Stock Level</label>
              <input type="number" value={form.MinimumStockLevel} onChange={e => setForm({...form, MinimumStockLevel: e.target.value})} />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Medicine</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">💊 All Medicines</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Medicine</th><th>Category</th><th>Supplier</th>
                <th>Batch</th><th>Expiry</th><th>Price</th><th>Stock</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(m => (
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
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.MedicineID)}>Delete</button>
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

export default Medicines;