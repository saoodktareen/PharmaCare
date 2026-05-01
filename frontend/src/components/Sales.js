import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function Sales() {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ MedicineID: '', CustomerID: '', QuantitySold: '', TotalAmount: '' });
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

  // Auto-calculate total when qty or medicine changes
  const handleMedicineChange = (medicineID) => {
    const med = medicines.find(m => m.MedicineID === parseInt(medicineID));
    const qty = parseInt(form.QuantitySold) || 0;
    setForm(f => ({
      ...f,
      MedicineID: medicineID,
      TotalAmount: med && qty ? (med.Price * qty).toFixed(2) : f.TotalAmount
    }));
  };

  const handleQtyChange = (qty) => {
    const med = medicines.find(m => m.MedicineID === parseInt(form.MedicineID));
    setForm(f => ({
      ...f,
      QuantitySold: qty,
      TotalAmount: med && qty ? (med.Price * parseInt(qty)).toFixed(2) : f.TotalAmount
    }));
  };

  const handleSubmit = async () => {
    const res = await fetch(`${API}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) { setForm({ MedicineID: '', CustomerID: '', QuantitySold: '', TotalAmount: '' }); setShowForm(false); load(); }
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading) return <div className="loading">Loading sales</div>;

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.TotalAmount), 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">{sales.length} transactions · Rs {totalRevenue.toLocaleString()} total revenue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Record Sale'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Record New Sale</div>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine</label>
              <select value={form.MedicineID} onChange={e => handleMedicineChange(e.target.value)}>
                <option value="">Select Medicine</option>
                {medicines.map(m => (
                  <option key={m.MedicineID} value={m.MedicineID}>
                    {m.MedicineName} — Rs {m.Price} (Stock: {m.StockLevel})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Customer</label>
              <select value={form.CustomerID} onChange={e => setForm({ ...form, CustomerID: e.target.value })}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={form.QuantitySold} onChange={e => handleQtyChange(e.target.value)} placeholder="0" min="1" />
            </div>
            <div className="form-group">
              <label>Total Amount (Rs) — auto calculated</label>
              <input type="number" value={form.TotalAmount} onChange={e => setForm({ ...form, TotalAmount: e.target.value })} placeholder="0.00" />
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
                  <td style={{ color: 'var(--text-muted)' }}>#{s.SaleID}</td>
                  <td style={{ fontWeight: 500 }}>{s.CustomerName}</td>
                  <td>{s.MedicineName}</td>
                  <td>{s.QuantitySold}</td>
                  <td style={{ color: 'var(--green)' }}>Rs {Number(s.TotalAmount).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(s.SaleDate).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Sales;