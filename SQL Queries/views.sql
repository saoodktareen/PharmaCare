USE PharmacyInventoryDB;
GO

-- ============================================================
--  1. vw_SalesSummary
--  Used by: Sales page
-- ============================================================
DROP VIEW IF EXISTS vw_SalesSummary;
GO

CREATE VIEW vw_SalesSummary AS
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
GO


-- ============================================================
--  2. vw_MedicinesDetail
--  Used by: Medicines page — replaces the big JOIN query
-- ============================================================
DROP VIEW IF EXISTS vw_MedicinesDetail;
GO

CREATE VIEW vw_MedicinesDetail AS
SELECT
    m.MedicineID,
    m.MedicineName,
    c.CategoryName,
    s.SupplierName,
    m.BatchNumber,
    m.ExpiryDate,
    m.Price,
    m.StockLevel,
    m.MinimumStockLevel,
    CASE
        WHEN m.StockLevel < m.MinimumStockLevel THEN 'Low Stock'
        WHEN m.ExpiryDate < GETDATE() THEN 'Expired'
        ELSE 'OK'
    END AS StockStatus
FROM Medicines m
LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
LEFT JOIN Suppliers s ON m.SupplierID = s.SupplierID
GO


-- ============================================================
--  3. vw_LowStockMedicines
--  Used by: Dashboard low stock alert panel
-- ============================================================
DROP VIEW IF EXISTS vw_LowStockMedicines;
GO

CREATE VIEW vw_LowStockMedicines AS
SELECT
    m.MedicineID,
    m.MedicineName,
    c.CategoryName,
    m.StockLevel,
    m.MinimumStockLevel,
    m.MinimumStockLevel - m.StockLevel AS UnitsNeeded
FROM Medicines m
LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
WHERE m.StockLevel < m.MinimumStockLevel
GO


-- ============================================================
--  4. vw_RestockOrders
--  Used by: Restock page
-- ============================================================
DROP VIEW IF EXISTS vw_RestockOrders;
GO

CREATE VIEW vw_RestockOrders AS
SELECT
    r.ReorderID,
    m.MedicineName,
    s.SupplierName,
    r.ReorderQuantity,
    r.ReorderDate,
    r.Status
FROM Restock r
JOIN Medicines m ON r.MedicineID = m.MedicineID
LEFT JOIN Suppliers s ON m.SupplierID = s.SupplierID
GO


-- ============================================================
--  5. vw_TransactionLog
--  Used by: Transactions page
-- ============================================================
DROP VIEW IF EXISTS vw_TransactionLog;
GO

CREATE VIEW vw_TransactionLog AS
SELECT
    t.TransactionID,
    m.MedicineName,
    c.CategoryName,
    t.TransactionType,
    t.Quantity,
    t.TransactionDate,
    t.Notes
FROM Transactions t
JOIN Medicines m ON t.MedicineID = m.MedicineID
LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
GO


-- ============================================================
--  6. vw_ExpiredMedicines
--  Bonus — useful to show on dashboard
-- ============================================================
DROP VIEW IF EXISTS vw_ExpiredMedicines;
GO

CREATE VIEW vw_ExpiredMedicines AS
SELECT
    m.MedicineID,
    m.MedicineName,
    c.CategoryName,
    m.BatchNumber,
    m.ExpiryDate,
    m.StockLevel,
    DATEDIFF(DAY, m.ExpiryDate, GETDATE()) AS DaysExpired
FROM Medicines m
LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
WHERE m.ExpiryDate < GETDATE()
GO


-- ============================================================
--  7. vw_RevenueByMedicine
--  Used by: Financial reports / admin dashboard
-- ============================================================
DROP VIEW IF EXISTS vw_RevenueByMedicine;
GO

CREATE VIEW vw_RevenueByMedicine AS
SELECT
    m.MedicineName,
    c.CategoryName,
    COUNT(s.SaleID) AS TotalSales,
    SUM(s.QuantitySold) AS TotalUnitsSold,
    SUM(s.TotalAmount) AS TotalRevenue,
    AVG(s.TotalAmount) AS AverageSaleAmount
FROM Sales s
JOIN Medicines m ON s.MedicineID = m.MedicineID
LEFT JOIN Categories c ON m.CategoryID = c.CategoryID
GROUP BY m.MedicineName, c.CategoryName
GO


-- ============================================================
--  VERIFY — list all created views
-- ============================================================
SELECT name, create_date
FROM sys.views
WHERE name IN (
    'vw_SalesSummary',
    'vw_MedicinesDetail',
    'vw_LowStockMedicines',
    'vw_RestockOrders',
    'vw_TransactionLog',
    'vw_ExpiredMedicines',
    'vw_RevenueByMedicine'
)
ORDER BY name;
GO