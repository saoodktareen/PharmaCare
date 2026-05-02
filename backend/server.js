require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// ─── Role Guard Middleware ────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

// ─── Database Configuration ───────────────────────────────────────────────────
const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'PharmacyInventoryDB',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
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
        process.exit(1);
    });


// ═══════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
    const { FullName, Email, Password, Role } = req.body;
    if (!FullName || !Email || !Password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FullName', sql.VarChar, FullName)
            .input('Email', sql.VarChar, Email)
            .input('Password', sql.VarChar, Password)
            .input('Role', sql.VarChar, Role || 'staff')
            .execute('sp_RegisterUser');
        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        if (err.message.includes('already registered')) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar, Email)
            .input('Password', sql.VarChar, Password)
            .execute('sp_LoginUser');
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.recordset[0];
        res.json({ message: 'Login successful', user });
    } catch (err) {
        if (err.message.includes('Email not found') || err.message.includes('Incorrect password')) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/users', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT UserID, FullName, Email, Role FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ═══════════════════════════════════════════════════════════
//  MEDICINES ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/medicines', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                m.MedicineID, m.MedicineName, c.CategoryName, s.SupplierName,
                m.BatchNumber, m.ExpiryDate, m.Price, m.StockLevel, m.MinimumStockLevel
            FROM Medicines m
            LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
            LEFT JOIN Suppliers s ON m.SupplierID = s.SupplierID
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/medicines/low-stock', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT MedicineName, StockLevel, MinimumStockLevel
            FROM Medicines WHERE StockLevel < MinimumStockLevel
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/medicines/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Medicines WHERE MedicineID = @id');
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Medicine not found' });
        res.json(result.recordset[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/medicines', requireAdmin, async (req, res) => {
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
            .execute('sp_AddMedicine');
        res.status(201).json({ message: 'Medicine added successfully' });
    } catch (err) {
        if (err.message.includes('already exists')) {
            return res.status(409).json({ error: 'Medicine with this name already exists' });
        }
        if (err.message.includes('Expiry')) {
            return res.status(400).json({ error: 'Expiry date must be in the future' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/medicines/:id', requireAdmin, async (req, res) => {
    const { MedicineName, Price, StockLevel, CategoryID, SupplierID, BatchNumber, ExpiryDate, MinimumStockLevel } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineID', sql.Int, req.params.id)
            .input('MedicineName', sql.VarChar, MedicineName)
            .input('CategoryID', sql.Int, CategoryID)
            .input('SupplierID', sql.Int, SupplierID)
            .input('BatchNumber', sql.VarChar, BatchNumber)
            .input('ExpiryDate', sql.Date, ExpiryDate)
            .input('Price', sql.Decimal(10, 2), Price)
            .input('StockLevel', sql.Int, StockLevel)
            .input('MinimumStockLevel', sql.Int, MinimumStockLevel)
            .execute('sp_UpdateMedicine');
        res.json({ message: 'Medicine updated successfully' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/medicines/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineID', sql.Int, req.params.id)
            .execute('sp_DeleteMedicine');
        res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
        if (err.message.includes('sales records')) {
            return res.status(400).json({ error: 'Cannot delete medicine — it has existing sales records' });
        }
        if (err.message.includes('restock orders')) {
            return res.status(400).json({ error: 'Cannot delete medicine — it has pending restock orders' });
        }
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
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', requireAdmin, async (req, res) => {
    const { CategoryName, Description } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CategoryName', sql.VarChar, CategoryName)
            .input('Description', sql.VarChar, Description || '')
            .query('INSERT INTO Categories (CategoryName, Description) VALUES (@CategoryName, @Description)');
        res.status(201).json({ message: 'Category added successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ═══════════════════════════════════════════════════════════
//  SUPPLIERS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/suppliers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Suppliers');
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/suppliers', requireAdmin, async (req, res) => {
    const { SupplierName, Phone, Email, Address } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('SupplierName', sql.VarChar, SupplierName)
            .input('Phone', sql.VarChar, Phone || '')
            .input('Email', sql.VarChar, Email || '')
            .input('Address', sql.VarChar, Address || '')
            .query('INSERT INTO Suppliers (SupplierName, Phone, Email, Address) VALUES (@SupplierName, @Phone, @Email, @Address)');
        res.status(201).json({ message: 'Supplier added successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ═══════════════════════════════════════════════════════════
//  CUSTOMERS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/customers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Customers');
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/customers', async (req, res) => {
    const { CustomerName, Phone, Email } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('CustomerName', sql.VarChar, CustomerName)
            .input('Phone', sql.VarChar, Phone || '')
            .input('Email', sql.VarChar, Email || '')
            .query('INSERT INTO Customers (CustomerName, Phone, Email) VALUES (@CustomerName, @Phone, @Email)');
        res.status(201).json({ message: 'Customer added successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ═══════════════════════════════════════════════════════════
//  SALES ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/sales', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT s.SaleID, c.CustomerName, m.MedicineName,
                   s.QuantitySold, s.TotalAmount, s.SaleDate
            FROM Sales s
            JOIN Customers c ON s.CustomerID = c.CustomerID
            JOIN Medicines m ON s.MedicineID = m.MedicineID
            ORDER BY s.SaleDate DESC
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sales', async (req, res) => {
    const { MedicineID, CustomerID, QuantitySold, TotalAmount } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineID', sql.Int, MedicineID)
            .input('CustomerID', sql.Int, CustomerID)
            .input('QuantitySold', sql.Int, QuantitySold)
            .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
            .execute('sp_RecordSale');
        res.status(201).json({ message: 'Sale recorded successfully' });
    } catch (err) {
        if (err.message.includes('Insufficient stock')) {
            return res.status(400).json({ error: 'Insufficient stock for this medicine' });
        }
        res.status(500).json({ error: err.message });
    }
});

// POST — bulk sale (multiple medicines, one customer)
app.post('/api/sales/bulk', async (req, res) => {
    const { CustomerID, items } = req.body;
    if (!CustomerID || !items || items.length === 0) {
        return res.status(400).json({ error: 'Customer and at least one item are required' });
    }
    try {
        const pool = await poolPromise;
        for (const item of items) {
            await pool.request()
                .input('MedicineID', sql.Int, item.MedicineID)
                .input('CustomerID', sql.Int, CustomerID)
                .input('QuantitySold', sql.Int, item.QuantitySold)
                .input('TotalAmount', sql.Decimal(10, 2), item.TotalAmount)
                .execute('sp_RecordSale'); // ✅ now calls procedure for each item
        }
        res.status(201).json({ message: `Sale recorded — ${items.length} item(s) added successfully` });
    } catch (err) {
        if (err.message.includes('Insufficient stock')) {
            return res.status(400).json({ error: 'Insufficient stock for one or more medicines' });
        }
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
            SELECT r.ReorderID, m.MedicineName, r.ReorderQuantity, r.ReorderDate, r.Status
            FROM Restock r
            JOIN Medicines m ON r.MedicineID = m.MedicineID
            ORDER BY r.ReorderDate DESC
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restock', async (req, res) => {
    const { MedicineID, ReorderQuantity } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('MedicineID', sql.Int, MedicineID)
            .input('ReorderQuantity', sql.Int, ReorderQuantity)
            .execute('sp_RestockMedicine');
        res.status(201).json({ message: 'Restock order created successfully' });
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/restock/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ReorderID', sql.Int, req.params.id)
            .execute('sp_ApproveRestock');
        res.json({ message: 'Restock approved and stock updated' });
    } catch (err) {
        if (err.message.includes('already approved')) {
            return res.status(400).json({ error: 'Restock order already approved' });
        }
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: 'Restock order not found' });
        }
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
            SELECT t.TransactionID, m.MedicineName, t.TransactionType,
                   t.Quantity, t.TransactionDate, t.Notes
            FROM Transactions t
            JOIN Medicines m ON t.MedicineID = m.MedicineID
            ORDER BY t.TransactionDate DESC
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ═══════════════════════════════════════════════════════════
//  DASHBOARD ROUTE
// ═══════════════════════════════════════════════════════════

app.get('/api/dashboard', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('sp_GetDashboard');
        res.json(result.recordset[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 DB: ${process.env.DB_SERVER || 'localhost'} / ${process.env.DB_NAME || 'PharmacyInventoryDB'}`);
});