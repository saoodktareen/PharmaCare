import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

// ─── Sales ────────────────────────────────────────────────────────────────────
export function Sales() {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ MedicineID:'', CustomerID:'', QuantitySold:'', TotalAmount:'' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/sales`).then(r => r.json()),
      fetch(`${API}/medicines`).then(r => r.json()),
      fetch(`${API}/customers`).then(r => r.json()),
    ]).then(([s, m, c]) => { setSales(s); setMedicines(m); setCustomers(c); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    const res = await fetch(`${API}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) { setForm({ MedicineID:'', CustomerID:'', QuantitySold:'', TotalAmount:'' }); setShowForm(false); load(); }
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading) return <div className="loading">Loading sales</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">{sales.length} transactions recorded</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Record Sale'}
        </button>
      </div>

      {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>{message.includes('success') ? '✅' : '❌'} {message}</div>}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Record New Sale</div>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine</label>
              <select value={form.MedicineID} onChange={e => setForm({...form, MedicineID: e.target.value})}>
                <option value="">Select Medicine</option>
                {medicines.map(m => <option key={m.MedicineID} value={m.MedicineID}>{m.MedicineName} (Stock: {m.StockLevel})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Customer</label>
              <select value={form.CustomerID} onChange={e => setForm({...form, CustomerID: e.target.value})}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={form.QuantitySold} onChange={e => setForm({...form, QuantitySold: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Total Amount (Rs)</label>
              <input type="number" value={form.TotalAmount} onChange={e => setForm({...form, TotalAmount: e.target.value})} placeholder="0.00" />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Save Sale</button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">🛒 All Sales</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Sale ID</th><th>Customer</th><th>Medicine</th><th>Qty</th><th>Total Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.SaleID}>
                  <td style={{ color:'var(--text-muted)' }}>#{s.SaleID}</td>
                  <td style={{ fontWeight:500 }}>{s.CustomerName}</td>
                  <td>{s.MedicineName}</td>
                  <td>{s.QuantitySold}</td>
                  <td style={{ color:'var(--green)' }}>Rs {Number(s.TotalAmount).toLocaleString()}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{new Date(s.SaleDate).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────
export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/customers`).then(r => r.json()).then(d => { setCustomers(d); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">Loading customers</div>;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Customers</h1>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">👤 All Customers</span>
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{customers.length} registered</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.CustomerID}>
                  <td style={{ color:'var(--text-muted)' }}>#{c.CustomerID}</td>
                  <td style={{ fontWeight:500 }}>{c.CustomerName}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{c.Phone}</td>
                  <td style={{ color:'var(--accent)', fontSize:'0.82rem' }}>{c.Email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Suppliers ────────────────────────────────────────────────────────────────
export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/suppliers`).then(r => r.json()).then(d => { setSuppliers(d); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">Loading suppliers</div>;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Suppliers</h1>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">🏭 All Suppliers</span>
          <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{suppliers.length} suppliers</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Supplier Name</th><th>Phone</th><th>Email</th><th>Address</th></tr></thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.SupplierID}>
                  <td style={{ color:'var(--text-muted)' }}>#{s.SupplierID}</td>
                  <td style={{ fontWeight:500 }}>{s.SupplierName}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{s.Phone}</td>
                  <td style={{ color:'var(--accent)', fontSize:'0.82rem' }}>{s.Email}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{s.Address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Restock ──────────────────────────────────────────────────────────────────
export function Restock() {
  const [restock, setRestock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/restock`).then(r => r.json()).then(d => { setRestock(d); setLoading(false); });
  }, []);

  const badgeClass = s => s === 'PENDING' ? 'badge-pending' : s === 'ORDERED' ? 'badge-ordered' : 'badge-received';

  if (loading) return <div className="loading">Loading restock data</div>;

  const pending  = restock.filter(r => r.Status === 'PENDING').length;
  const ordered  = restock.filter(r => r.Status === 'ORDERED').length;
  const received = restock.filter(r => r.Status === 'RECEIVED').length;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Restock Orders</h1>

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

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">📦 All Restock Orders</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Medicine</th><th>Reorder Qty</th><th>Reorder Date</th><th>Status</th></tr></thead>
            <tbody>
              {restock.map(r => (
                <tr key={r.ReorderID}>
                  <td style={{ color:'var(--text-muted)' }}>#{r.ReorderID}</td>
                  <td style={{ fontWeight:500 }}>{r.MedicineName}</td>
                  <td>{r.ReorderQuantity}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{new Date(r.ReorderDate).toLocaleDateString('en-GB')}</td>
                  <td><span className={`badge ${badgeClass(r.Status)}`}>{r.Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}