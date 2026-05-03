import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';
const emptyItem = { MedicineID: '', QuantitySold: '', TotalAmount: '' };

function Sales({ user }) {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerID, setCustomerID] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/sales`).then(r => r.json()),
      fetch(`${API}/medicines`).then(r => r.json()),
      fetch(`${API}/customers`).then(r => r.json()),
    ]).then(([s, m, c]) => {
      setSales(s); setMedicines(m); setCustomers(c); setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'error') => {
    setMessage({ text, type });
    // Only auto-clear success messages; keep errors visible until user acts
    if (type === 'success') setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleItemMedicine = (index, medicineID) => {
    const med = medicines.find(m => m.MedicineID === parseInt(medicineID));
    const qty = parseInt(items[index].QuantitySold) || 0;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      MedicineID: medicineID,
      TotalAmount: med && qty ? (med.Price * qty).toFixed(2) : ''
    };
    setItems(updated);
    // Clear any existing error when user changes selection
    setMessage({ text: '', type: '' });
  };

  const handleItemQty = (index, qty) => {
    const med = medicines.find(m => m.MedicineID === parseInt(items[index].MedicineID));
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      QuantitySold: qty,
      TotalAmount: med && qty ? (med.Price * parseInt(qty)).toFixed(2) : ''
    };
    setItems(updated);

    // Immediate frontend stock warning as user types
    if (med && parseInt(qty) > med.StockLevel) {
      setMessage({
        text: `⚠️ "${med.MedicineName}" only has ${med.StockLevel} units in stock`,
        type: 'error'
      });
    } else {
      setMessage({ text: '', type: '' });
    }
  };

  const addRow = () => setItems(prev => [...prev, { ...emptyItem }]);

  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    setMessage({ text: '', type: '' });
  };

  const grandTotal = items.reduce((sum, it) => sum + (parseFloat(it.TotalAmount) || 0), 0);

  const handleSubmit = async () => {
    // ── Frontend validation ──────────────────────────────────
    if (!customerID) {
      return showMsg('Please select a customer before saving.');
    }
    if (items.some(it => !it.MedicineID || !it.QuantitySold)) {
      return showMsg('Please fill in all medicine rows completely.');
    }

    // Stock check against live medicine data before hitting the server
    for (const item of items) {
      const med = medicines.find(m => m.MedicineID === parseInt(item.MedicineID));
      if (med && parseInt(item.QuantitySold) > med.StockLevel) {
        return showMsg(
          `Insufficient stock for "${med.MedicineName}" — only ${med.StockLevel} unit(s) available, you entered ${item.QuantitySold}.`
        );
      }
    }

    // ── Submit to backend ────────────────────────────────────
    try {
      const res = await fetch(`${API}/sales/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CustomerID: customerID, items })
      });
      const data = await res.json();

      if (!res.ok) {
        // Server-side error (e.g. race condition where stock ran out between check and save)
        return showMsg(data.error || 'Failed to record sale. Please try again.');
      }

      showMsg(data.message || 'Sale recorded successfully', 'success');
      setCustomerID('');
      setItems([{ ...emptyItem }]);
      setShowForm(false);
      load();
    } catch {
      showMsg('Cannot connect to server. Is your backend running?');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setCustomerID('');
    setItems([{ ...emptyItem }]);
    setMessage({ text: '', type: '' });
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
        <button className="btn btn-primary" onClick={() => showForm ? cancelForm() : setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ Record Sale'}
        </button>
      </div>

      {/* ── Alert banner — stays visible until resolved ── */}
      {message.text && (
        <div
          className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
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
          <div className="form-panel-title">➕ Record New Sale</div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label>Customer</label>
              <select value={customerID} onChange={e => setCustomerID(e.target.value)}>
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {items.map((item, index) => {
              const selectedMed = medicines.find(m => m.MedicineID === parseInt(item.MedicineID));
              const overStock = selectedMed && parseInt(item.QuantitySold) > selectedMed.StockLevel;

              return (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr auto',
                  gap: 10,
                  alignItems: 'end',
                  background: overStock ? 'rgba(255,77,106,0.07)' : 'var(--bg-secondary, #141920)',
                  border: `1px solid ${overStock ? 'rgba(255,77,106,0.4)' : 'var(--border, #1e2838)'}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  transition: 'all 0.2s'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Medicine {index + 1}</label>
                    <select value={item.MedicineID} onChange={e => handleItemMedicine(index, e.target.value)}>
                      <option value="">Select Medicine</option>
                      {medicines.map(m => (
                        <option key={m.MedicineID} value={m.MedicineID}>
                          {m.MedicineName} — Rs {m.Price} (Stock: {m.StockLevel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: overStock ? '#ff4d6a' : undefined }}>
                      Quantity {overStock && `(max ${selectedMed.StockLevel})`}
                    </label>
                    <input
                      type="number"
                      value={item.QuantitySold}
                      onChange={e => handleItemQty(index, e.target.value)}
                      placeholder="0"
                      min="1"
                      style={{ borderColor: overStock ? 'rgba(255,77,106,0.6)' : undefined }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Subtotal (Rs)</label>
                    <input
                      type="number"
                      value={item.TotalAmount}
                      onChange={e => {
                        const updated = [...items];
                        updated[index] = { ...updated[index], TotalAmount: e.target.value };
                        setItems(updated);
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeRow(index)}
                    style={{ marginBottom: 2 }}
                    disabled={items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <button className="btn btn-ghost" onClick={addRow}>+ Add Another Medicine</button>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green, #00c48c)' }}>
              Grand Total: Rs {grandTotal.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={items.some(it => {
                const med = medicines.find(m => m.MedicineID === parseInt(it.MedicineID));
                return med && parseInt(it.QuantitySold) > med.StockLevel;
              })}
            >
              💾 Save Sale
            </button>
            <button className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
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
              <tr>
                <th>Sale ID</th><th>Customer</th><th>Medicine</th>
                <th>Qty</th><th>Total Amount</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.SaleID}>
                  <td style={{ color: 'var(--text-muted)' }}>#{s.SaleID}</td>
                  <td style={{ fontWeight: 500 }}>{s.CustomerName}</td>
                  <td>{s.MedicineName}</td>
                  <td>{s.QuantitySold}</td>
                  <td style={{ color: 'var(--green)' }}>Rs {Number(s.TotalAmount).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(s.SaleDate).toLocaleDateString('en-GB')}
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

export default Sales;
