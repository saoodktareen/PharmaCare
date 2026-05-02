import React, { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

const emptyItem = { MedicineID: '', QuantitySold: '', TotalAmount: '' };

function Sales() {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerID, setCustomerID] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]); // list of medicine rows
  const [message, setMessage] = useState('');
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

  // Update a specific row's medicine and recalculate total
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
  };

  // Update a specific row's quantity and recalculate total
  const handleItemQty = (index, qty) => {
    const med = medicines.find(m => m.MedicineID === parseInt(items[index].MedicineID));
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      QuantitySold: qty,
      TotalAmount: med && qty ? (med.Price * parseInt(qty)).toFixed(2) : ''
    };
    setItems(updated);
  };

  // Add a new empty medicine row
  const addRow = () => setItems(prev => [...prev, { ...emptyItem }]);

  // Remove a row (keep at least 1)
  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, it) => sum + (parseFloat(it.TotalAmount) || 0), 0);

  const handleSubmit = async () => {
    if (!customerID) return setMessage('Please select a customer');
    if (items.some(it => !it.MedicineID || !it.QuantitySold)) {
      return setMessage('Please fill in all medicine rows');
    }

    const res = await fetch(`${API}/sales/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ CustomerID: customerID, items })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) {
      setCustomerID('');
      setItems([{ ...emptyItem }]);
      setShowForm(false);
      load();
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const cancelForm = () => {
    setShowForm(false);
    setCustomerID('');
    setItems([{ ...emptyItem }]);
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

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message.includes('success') ? '✅' : '❌'} {message}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-title">➕ Record New Sale</div>

          {/* Customer selector — once for the whole sale */}
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

          {/* Medicine rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {items.map((item, index) => {
              const selectedMed = medicines.find(m => m.MedicineID === parseInt(item.MedicineID));
              return (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr auto',
                  gap: 10,
                  alignItems: 'end',
                  background: 'var(--bg-secondary, #141920)',
                  border: '1px solid var(--border, #1e2838)',
                  borderRadius: 8,
                  padding: '12px 14px'
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
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={item.QuantitySold}
                      onChange={e => handleItemQty(index, e.target.value)}
                      placeholder="0"
                      min="1"
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

          {/* Add row + grand total + submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <button className="btn btn-ghost" onClick={addRow}>+ Add Another Medicine</button>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green, #00c48c)' }}>
              Grand Total: Rs {grandTotal.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSubmit}>💾 Save Sale</button>
            <button className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* Sales table */}
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