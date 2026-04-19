const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());          // Allows React (port 3000) to call this server
app.use(express.json());  // Lets us read JSON from request bodies

// ─── Database Configuration ───────────────────────────────────────────────────
const dbConfig = {
    server: 'localhost',  // ← try this first, or just 'localhost'
    database: 'PharmacyInventoryDB',
    user: 'sa',
    password: 'Pa55w0rd1303',     // ← put your actual sa password here
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
// ─── Connect to Database ──────────────────────────────────────────────────────
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1); // Stop server if DB can't connect
    });


// ═══════════════════════════════════════════════════════════
//  MEDICINES ROUTES
// ═══════════════════════════════════════════════════════════

// GET all medicines (with category and supplier names joined in)
app.get('/api/medicines', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                m.MedicineID,
                m.MedicineName,
                c.CategoryName,
                s.SupplierName,
                m.BatchNumber,
                m.ExpiryDate,
                m.Price,
                m.StockLevel,
                m.MinimumStockLevel
            FROM Medicines m
            LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
            LEFT JOIN Suppliers s ON m.SupplierID = s.SupplierID
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET medicines with low stock (below minimum level) — useful for alerts
app.get('/api/medicines/low-stock', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT MedicineName, StockLevel, MinimumStockLevel
            FROM Medicines
            WHERE StockLevel < MinimumStockLevel
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a single medicine by ID
app.get('/api/medicines/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Medicines WHERE MedicineID = @id');
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST — Add a new medicine
app.post('/api/medicines', async (req, res) => {
    const { MedicineName, CategoryID, SupplierID, BatchNumber, ExpiryDate, Price, StockLevel, MinimumStockLevel } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineName', sql.VarChar, MedicineName)
            .input('CategoryID', sql.Int, CategoryID)
            .input('SupplierID', sql.Int, SupplierID)
            .input('BatchNumber', sql.VarChar, BatchNumber)
            .input('ExpiryDate', sql.Date, ExpiryDate)
            .input('Price', sql.Decimal(10, 2), Price)
            .input('StockLevel', sql.Int, StockLevel)
            .input('MinimumStockLevel', sql.Int, MinimumStockLevel || 10)
            .query(`
                INSERT INTO Medicines 
                (MedicineName, CategoryID, SupplierID, BatchNumber, ExpiryDate, Price, StockLevel, MinimumStockLevel)
                VALUES (@MedicineName, @CategoryID, @SupplierID, @BatchNumber, @ExpiryDate, @Price, @StockLevel, @MinimumStockLevel)
            `);
        res.status(201).json({ message: 'Medicine added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT — Update a medicine
app.put('/api/medicines/:id', async (req, res) => {
    const { MedicineName, Price, StockLevel } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('MedicineName', sql.VarChar, MedicineName)
            .input('Price', sql.Decimal(10, 2), Price)
            .input('StockLevel', sql.Int, StockLevel)
            .query(`
                UPDATE Medicines 
                SET MedicineName = @MedicineName, Price = @Price, StockLevel = @StockLevel
                WHERE MedicineID = @id
            `);
        res.json({ message: 'Medicine updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE — Remove a medicine
app.delete('/api/medicines/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Medicines WHERE MedicineID = @id');
        res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  CATEGORIES ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/categories', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Categories');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  SUPPLIERS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/suppliers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Suppliers');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  CUSTOMERS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/customers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Customers');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  SALES ROUTES
// ═══════════════════════════════════════════════════════════

// GET all sales with customer and medicine names
app.get('/api/sales', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                s.SaleID,
                c.CustomerName,
                m.MedicineName,
                s.QuantitySold,
                s.TotalAmount,
                s.SaleDate
            FROM Sales s
            JOIN Customers c ON s.CustomerID = c.CustomerID
            JOIN Medicines m ON s.MedicineID = m.MedicineID
            ORDER BY s.SaleDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST — Record a new sale
app.post('/api/sales', async (req, res) => {
    const { MedicineID, CustomerID, QuantitySold, TotalAmount } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineID', sql.Int, MedicineID)
            .input('CustomerID', sql.Int, CustomerID)
            .input('QuantitySold', sql.Int, QuantitySold)
            .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
            .query(`
                INSERT INTO Sales (MedicineID, CustomerID, QuantitySold, TotalAmount)
                VALUES (@MedicineID, @CustomerID, @QuantitySold, @TotalAmount)
            `);
        res.status(201).json({ message: 'Sale recorded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  RESTOCK ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/restock', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                r.ReorderID,
                m.MedicineName,
                r.ReorderQuantity,
                r.ReorderDate,
                r.Status
            FROM Restock r
            JOIN Medicines m ON r.MedicineID = m.MedicineID
            ORDER BY r.ReorderDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  TRANSACTIONS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/transactions', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                t.TransactionID,
                m.MedicineName,
                t.TransactionType,
                t.Quantity,
                t.TransactionDate,
                t.Notes
            FROM Transactions t
            JOIN Medicines m ON t.MedicineID = m.MedicineID
            ORDER BY t.TransactionDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  DASHBOARD SUMMARY ROUTE
// ═══════════════════════════════════════════════════════════

app.get('/api/dashboard', async (req, res) => {
    try {
        const pool = await poolPromise;

        const totalMedicines = await pool.request()
            .query('SELECT COUNT(*) AS count FROM Medicines');

        const totalSales = await pool.request()
            .query('SELECT COUNT(*) AS count, SUM(TotalAmount) AS revenue FROM Sales');

        const lowStock = await pool.request()
            .query('SELECT COUNT(*) AS count FROM Medicines WHERE StockLevel < MinimumStockLevel');

        const pendingRestock = await pool.request()
            .query("SELECT COUNT(*) AS count FROM Restock WHERE Status = 'PENDING'");

        res.json({
            totalMedicines: totalMedicines.recordset[0].count,
            totalSales: totalSales.recordset[0].count,
            totalRevenue: totalSales.recordset[0].revenue,
            lowStockCount: lowStock.recordset[0].count,
            pendingRestock: pendingRestock.recordset[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});