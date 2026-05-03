import React, { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

function Reports({ user }) {
  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': user?.Role || 'staff'
  };

  // ── Sales by date range ───────────────────────────────────
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate]   = useState(new Date().toISOString().split('T')[0]);
  const [salesReport, setSalesReport] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);

  // ── Stock value ───────────────────────────────────────────
  const [stockValue, setStockValue] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);

  // ── Customer history ──────────────────────────────────────
  const [customers, setCustomers]       = useState([]);
  const [selectedCust, setSelectedCust] = useState('');
  const [custHistory, setCustHistory]   = useState(null);
  const [histLoading, setHistLoading]   = useState(false);

  // ── Active tab ────────────────────────────────────────────
  const [tab, setTab] = useState('sales');

  useEffect(() => {
    fetch(`${API}/customers`).then(r => r.json()).then(setCustomers).catch(() => {});
  }, []);

  const fetchSalesReport = async () => {
    setSalesLoading(true);
    try {
      const res = await fetch(`${API}/reports/sales?from=${fromDate}&to=${toDate}`, { headers: authHeaders });
      const data = await res.json();
      setSalesReport(data);
    } catch { setSalesReport(null); }
    setSalesLoading(false);
  };

  const fetchStockValue = async () => {
    setStockLoading(true);
    try {
      const res = await fetch(`${API}/reports/stock-value`, { headers: authHeaders });
      const data = await res.json();
      setStockValue(data);
    } catch { setStockValue(null); }
    setStockLoading(false);
  };

  const fetchCustHistory = async () => {
    if (!selectedCust) return;
    setHistLoading(true);
    try {
      const res = await fetch(`${API}/customers/${selectedCust}/history`);
      const data = await res.json();
      setCustHistory(data);
    } catch { setCustHistory(null); }
    setHistLoading(false);
  };

  const tabStyle = (id) => ({
    padding: '9px 18px',
    border: 'none',
    borderRadius: 6,
    background: tab === id ? '#1a2230' : 'none',
    color: tab === id ? '#00d4ff' : '#3d5068',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.03em',
    transition: 'all 0.2s',
    boxShadow: tab === id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
  });

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Analytics & data export for admin use</p>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#141920',
        border: '1px solid #1e2838',
        borderRadius: 8,
        padding: 4,
        marginTop: 24, marginBottom: 28,
        width: 'fit-content'
      }}>
        <button style={tabStyle('sales')}   onClick={() => setTab('sales')}>📅 Sales by Date</button>
        <button style={tabStyle('stock')}   onClick={() => { setTab('stock'); if (!stockValue) fetchStockValue(); }}>📦 Stock Value</button>
        <button style={tabStyle('history')} onClick={() => setTab('history')}>👤 Customer History</button>
      </div>

      {/* ── Sales by Date Range ── */}
      {tab === 'sales' && (
        <div>
          <div className="form-panel" style={{ marginBottom: 20 }}>
            <div className="form-panel-title">📅 Sales Report by Date Range</div>
            <div className="form-row">
              <div className="form-group">
                <label>From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn btn-primary" onClick={fetchSalesReport} disabled={salesLoading}>
                  {salesLoading ? 'Loading…' : '🔍 Generate Report'}
                </button>
              </div>
            </div>
          </div>

          {salesReport && (
            <div>
              {/* Summary cards */}
              <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card blue">
                  <span className="stat-icon">🛒</span>
                  <div className="stat-value">{salesReport.totalSales}</div>
                  <div className="stat-label">Total Sales</div>
                </div>
                <div className="stat-card green">
                  <span className="stat-icon">💰</span>
                  <div className="stat-value">Rs {Number(salesReport.totalRevenue).toLocaleString()}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card amber">
                  <span className="stat-icon">💊</span>
                  <div className="stat-value">{salesReport.totalQty}</div>
                  <div className="stat-label">Units Sold</div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Sales — {salesReport.from} to {salesReport.to}</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Sale ID</th><th>Customer</th><th>Medicine</th>
                        <th>Qty</th><th>Total</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.sales.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No sales in this date range</td></tr>
                      ) : salesReport.sales.map(s => (
                        <tr key={s.SaleID}>
                          <td style={{ color: 'var(--text-muted)' }}>#{s.SaleID}</td>
                          <td style={{ fontWeight: 500 }}>{s.CustomerName}</td>
                          <td>{s.MedicineName}</td>
                          <td>{s.QuantitySold}</td>
                          <td style={{ color: 'var(--green)' }}>Rs {Number(s.TotalAmount).toLocaleString()}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{s.SaleDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Stock Value ── */}
      {tab === 'stock' && (
        <div>
          {stockLoading && <div className="loading">Calculating stock value…</div>}
          {stockValue && (
            <div>
              <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card green">
                  <span className="stat-icon">💎</span>
                  <div className="stat-value">Rs {Number(stockValue.totalValue).toLocaleString()}</div>
                  <div className="stat-label">Total Inventory Value</div>
                </div>
                <div className="stat-card blue">
                  <span className="stat-icon">💊</span>
                  <div className="stat-value">{stockValue.medicines.length}</div>
                  <div className="stat-label">Medicine SKUs</div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">📦 Stock Value Report (Price × Stock)</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Medicine</th><th>Category</th><th>Price</th>
                        <th>Stock</th><th>Total Value</th><th>Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockValue.medicines.map(m => (
                        <tr key={m.MedicineID}>
                          <td style={{ fontWeight: 500 }}>{m.MedicineName}</td>
                          <td>{m.CategoryName}</td>
                          <td>Rs {m.Price}</td>
                          <td>{m.StockLevel}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 600 }}>
                            Rs {Number(m.StockValue).toLocaleString()}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {m.ExpiryDate ? new Date(m.ExpiryDate).toLocaleDateString('en-GB') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customer History ── */}
      {tab === 'history' && (
        <div>
          <div className="form-panel" style={{ marginBottom: 20 }}>
            <div className="form-panel-title">👤 Customer Purchase History</div>
            <div className="form-row">
              <div className="form-group">
                <label>Select Customer</label>
                <select value={selectedCust} onChange={e => setSelectedCust(e.target.value)}>
                  <option value="">Choose a customer…</option>
                  {customers.map(c => (
                    <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn btn-primary" onClick={fetchCustHistory} disabled={!selectedCust || histLoading}>
                  {histLoading ? 'Loading…' : '🔍 Lookup History'}
                </button>
              </div>
            </div>
          </div>

          {custHistory && (
            <div>
              {custHistory.customer && (
                <div className="stats-grid" style={{ marginBottom: 20 }}>
                  <div className="stat-card blue">
                    <span className="stat-icon">👤</span>
                    <div className="stat-value">{custHistory.customer.CustomerName}</div>
                    <div className="stat-label">{custHistory.customer.Phone || 'No phone'}</div>
                  </div>
                  <div className="stat-card green">
                    <span className="stat-icon">💰</span>
                    <div className="stat-value">Rs {Number(custHistory.totalSpent).toLocaleString()}</div>
                    <div className="stat-label">Total Spent</div>
                  </div>
                  <div className="stat-card amber">
                    <span className="stat-icon">🛒</span>
                    <div className="stat-value">{custHistory.purchases.length}</div>
                    <div className="stat-label">Purchases</div>
                  </div>
                </div>
              )}

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Purchase History</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Sale ID</th><th>Medicine</th><th>Qty</th><th>Total</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {custHistory.purchases.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No purchases found</td></tr>
                      ) : custHistory.purchases.map(p => (
                        <tr key={p.SaleID}>
                          <td style={{ color: 'var(--text-muted)' }}>#{p.SaleID}</td>
                          <td style={{ fontWeight: 500 }}>{p.MedicineName}</td>
                          <td>{p.QuantitySold}</td>
                          <td style={{ color: 'var(--green)' }}>Rs {Number(p.TotalAmount).toLocaleString()}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {new Date(p.SaleDate).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;