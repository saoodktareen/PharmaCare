-- Create Database
CREATE DATABASE PharmacyInventoryDB;
GO

USE PharmacyInventoryDB;
GO

-- 1. Categories Table

CREATE TABLE Categories (
CategoryID INT IDENTITY(1,1) PRIMARY KEY,
CategoryName VARCHAR(100) NOT NULL,
Description VARCHAR(255)
);
GO

-- 2. Suppliers Table

CREATE TABLE Suppliers (
SupplierID INT IDENTITY(1,1) PRIMARY KEY,
SupplierName VARCHAR(150) NOT NULL,
Phone VARCHAR(20),
Email VARCHAR(100),
Address VARCHAR(255)
);
GO

-- 3. Medicines Table

CREATE TABLE Medicines (
MedicineID INT IDENTITY(1,1) PRIMARY KEY,
MedicineName VARCHAR(150) NOT NULL,
CategoryID INT NULL,
SupplierID INT NULL,
BatchNumber VARCHAR(50) NOT NULL,
ExpiryDate DATE NOT NULL,
Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
StockLevel INT NOT NULL CHECK (StockLevel >= 0),
MinimumStockLevel INT DEFAULT 10,

CONSTRAINT FK_Medicines_Categories
    FOREIGN KEY (CategoryID)
    REFERENCES Categories(CategoryID)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

CONSTRAINT FK_Medicines_Suppliers
    FOREIGN KEY (SupplierID)
    REFERENCES Suppliers(SupplierID)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
GO

-- 4. Customers Table

CREATE TABLE Customers (
CustomerID INT IDENTITY(1,1) PRIMARY KEY,
CustomerName VARCHAR(150) NOT NULL,
Phone VARCHAR(20),
Email VARCHAR(100)
);
GO

-- 5. Sales Table

CREATE TABLE Sales (
SaleID INT IDENTITY(1,1) PRIMARY KEY,
MedicineID INT NOT NULL,
CustomerID INT NULL,
QuantitySold INT NOT NULL CHECK (QuantitySold > 0),
SaleDate DATETIME DEFAULT GETDATE(),
TotalAmount DECIMAL(10,2),

CONSTRAINT FK_Sales_Medicines
    FOREIGN KEY (MedicineID)
    REFERENCES Medicines(MedicineID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

CONSTRAINT FK_Sales_Customers
    FOREIGN KEY (CustomerID)
    REFERENCES Customers(CustomerID)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
GO

-- 6. Transactions Table

CREATE TABLE Transactions (
TransactionID INT IDENTITY(1,1) PRIMARY KEY,
MedicineID INT NOT NULL,
SaleID INT NULL,
TransactionType VARCHAR(20) NOT NULL
    CHECK (TransactionType IN ('SALE','RESTOCK')),
Quantity INT NOT NULL CHECK (Quantity > 0),
TransactionDate DATETIME DEFAULT GETDATE(),
Notes VARCHAR(255),

CONSTRAINT FK_Transactions_Medicines
    FOREIGN KEY (MedicineID)
    REFERENCES Medicines(MedicineID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

CONSTRAINT FK_Transactions_Sales
    FOREIGN KEY (SaleID)
    REFERENCES Sales(SaleID)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);
GO

-- 7. Restock Table

CREATE TABLE Restock (
ReorderID INT IDENTITY(1,1) PRIMARY KEY,
MedicineID INT NOT NULL,
ReorderQuantity INT NOT NULL CHECK (ReorderQuantity > 0),
ReorderDate DATETIME DEFAULT GETDATE(),
Status VARCHAR(20) DEFAULT 'PENDING'
    CHECK (Status IN ('PENDING','ORDERED','RECEIVED')),

CONSTRAINT FK_Restock_Medicines
    FOREIGN KEY (MedicineID)
    REFERENCES Medicines(MedicineID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
GO

-- 8. Users Table

CREATE TABLE Users (
UserID    INT IDENTITY(1,1) PRIMARY KEY,
FullName  VARCHAR(100) NOT NULL,
Email     VARCHAR(100) NOT NULL UNIQUE,
Password  VARCHAR(255) NOT NULL,
Role      VARCHAR(20)  NOT NULL DEFAULT 'staff',
CreatedAt DATETIME     DEFAULT GETDATE()
);
GO

-- (1) INSERT
INSERT INTO Categories (CategoryName, Description) VALUES
('Antibiotics', 'Medicines that fight bacterial infections'),
('Painkillers', 'Relieve pain and fever'),
('Vitamins', 'Nutritional supplements'),
('Neurology', 'Medicines for nervous system disorders'),
('Oncology', 'Cancer treatment medicines'),
('Gastrointestinal', 'Digestive system medicines'),
('Orthopedics', 'Bone and joint care'),
('Psychiatry', 'Mental health medicines'),
('Immunology', 'Immune system boosters'),
('Endocrinology', 'Hormone-related medicines'),
('Ophthalmology', 'Eye care medicines'),
('Dental Care', 'Oral health medicines'),
('Pediatrics', 'Children’s medicines'),
('Respiratory', 'Asthma and lung medicines'),
('Dermatology', 'Skin-related medicines');

-- Customers
INSERT INTO Customers (CustomerName, Phone, Email) VALUES
('Abdullah Nawaz', '123234345', 'abdullah@email.com'),
('Nouman Malik', '345456567', 'nouman@email.com'),
('Saood Khan Tareen', '67878989', 'saood@email.com'),
('Sara Ahmed', '03005556677', 'sara@email.com'),
('Bilal Hussain', '03334445566', 'bilal@email.com'),
('Ayesha Khan', '03112223344', 'ayesha@email.com'),
('Hamza Ali', '03223334455', 'hamza@email.com'),
('Fatima Zahra', '03445556677', 'fatima@email.com'),
('Usman Riaz', '03556667788', 'usman@email.com'),
('Zara Sheikh', '03667778899', 'zara@email.com'),
('Imran Shah', '03012345678', 'imran.shah@email.com'),
('Nida Farooq', '03123456789', 'nida.farooq@email.com'),
('Kashif Mehmood', '03234567890', 'kashif.mehmood@email.com'),
('Rabia Tariq', '03345678901', 'rabia.tariq@email.com'),
('Omar Siddiqui', '03456789012', 'omar.siddiqui@email.com');

INSERT INTO Suppliers (SupplierName, Phone, Email, Address) VALUES
('HealthCare Distributors', '03001234567', 'contact@healthcare.com', 'Lahore'),
('MediSupply Pvt Ltd', '03119876543', 'info@medisupply.com', 'Karachi'),
('PharmaLink', '03211223344', 'sales@pharmalink.com', 'Islamabad'),
('Global Pharma', '03322334455', 'global@pharma.com', 'Multan'),
('LifeLine Suppliers', '03433445566', 'lifeline@suppliers.com', 'Faisalabad'),
('CureMed Distributors', '03544556677', 'curemed@distributors.com', 'Rawalpindi'),
('PakPharma', '03655667788', 'pakpharma@pak.com', 'Quetta'),
('MediTrust', '03766778899', 'meditrust@trust.com', 'Peshawar'),
('SafeMeds', '03877889900', 'safemeds@safe.com', 'Hyderabad'),
('BioCare Suppliers', '03988990011', 'biocare@suppliers.com', 'Sialkot'),
('WellCare Pharma', '03099887766', 'wellcare@pharma.com', 'Lahore'),
('PrimeMed Suppliers', '03188776655', 'prime@med.com', 'Karachi'),
('TrustPharma', '03277665544', 'trust@pharma.com', 'Islamabad'),
('Medico Distributors', '03366554433', 'medico@distributors.com', 'Multan'),
('PakHealth Suppliers', '03455443322', 'pakhealth@suppliers.com', 'Faisalabad');

INSERT INTO Medicines (MedicineName, CategoryID, SupplierID, BatchNumber, ExpiryDate, Price, StockLevel, MinimumStockLevel) VALUES
('Amoxicillin', 1, 1, 'BATCH-A001', '2026-12-31', 150.00, 100, 10),
('Paracetamol', 2, 2, 'BATCH-P002', '2027-06-30', 55.00, 200, 20),
('Vitamin C', 3, 3, 'BATCH-V003', '2028-01-15', 75.00, 150, 15),
('Ibuprofen', 2, 4, 'BATCH-I004', '2027-08-15', 60.00, 180, 20),
('Omeprazole', 6, 5, 'BATCH-O005', '2026-10-20', 220.00, 90, 10),
('Sertraline', 8, 6, 'BATCH-S006', '2028-04-05', 500.00, 40, 5),
('Prednisone', 9, 7, 'BATCH-P007', '2027-01-30', 300.00, 70, 10),
('Insulin', 10, 8, 'BATCH-IN008', '2026-09-12', 1200.00, 50, 5),
('Latanoprost Eye Drops', 11, 9, 'BATCH-L009', '2027-11-25', 800.00, 30, 5),
('Calcium Tablets', 7, 10, 'BATCH-C010', '2028-02-14', 150.00, 200, 20),
('Ranitidine', 6, 11, 'BATCH-R011', '2026-06-18', 100.00, 120, 10),
('Clopidogrel', 7, 12, 'BATCH-C012', '2027-12-22', 400.00, 60, 5),
('Diazepam', 8, 13, 'BATCH-D013', '2028-03-09', 350.00, 80, 10),
('Hydrocortisone Cream', 15, 14, 'BATCH-H014', '2026-07-25', 180.00, 50, 5),
('Salbutamol Inhaler', 14, 15, 'BATCH-S015', '2027-03-12', 350.00, 40, 5);

INSERT INTO Sales (MedicineID, CustomerID, QuantitySold, TotalAmount) VALUES
(1, 1, 2, 300.00),
(2, 2, 5, 275.00),
(3, 3, 3, 225.00),
(4, 4, 2, 120.00),
(5, 5, 1, 220.00),
(6, 6, 4, 2000.00),
(7, 7, 10, 3000.00),
(8, 8, 2, 2400.00),
(9, 9, 1, 800.00),
(10, 10, 3, 450.00),
(11, 11, 5, 500.00),
(12, 12, 2, 800.00),
(13, 13, 1, 350.00),
(14, 14, 2, 360.00),
(15, 15, 1, 350.00);

INSERT INTO Transactions (MedicineID, SaleID, TransactionType, Quantity, Notes) VALUES
(1, 1, 'SALE', 2, 'Sale of Amoxicillin to Abdullah'),
(2, 2, 'SALE', 5, 'Sale of Paracetamol to Nouman'),
(3, 3, 'SALE', 3, 'Sale of Vitamin C to Saood'),
(4, 4, 'SALE', 2, 'Sale of Ibuprofen to Sara'),
(5, 5, 'SALE', 1, 'Sale of Omeprazole to Bilal'),
(6, 6, 'SALE', 4, 'Sale of Sertraline to Ayesha'),
(7, 7, 'SALE', 10, 'Sale of Prednisone to Hamza'),
(8, 8, 'SALE', 2, 'Sale of Insulin to Fatima'),
(9, 9, 'SALE', 1, 'Sale of Latanoprost Eye Drops to Usman'),
(10, 10, 'SALE', 3, 'Sale of Calcium Tablets to Zara'),
(11, 11, 'SALE', 5, 'Sale of Ranitidine to Imran'),
(12, 12, 'SALE', 2, 'Sale of Clopidogrel to Nida'),
(13, 13, 'SALE', 1, 'Sale of Diazepam to Kashif'),
(14, 14, 'SALE', 2, 'Sale of Hydrocortisone Cream to Rabia'),
(15, 15, 'SALE', 1, 'Sale of Salbutamol Inhaler to Omar');

INSERT INTO Restock (MedicineID, ReorderQuantity, Status) VALUES
(1, 50, 'PENDING'),
(2, 100, 'ORDERED'),
(3, 75, 'RECEIVED'),
(4, 60, 'PENDING'),
(5, 40, 'ORDERED'),
(6, 100, 'RECEIVED'),
(7, 200, 'PENDING'),
(8, 50, 'ORDERED'),
(9, 30, 'RECEIVED'),
(10, 20, 'PENDING'),
(11, 150, 'ORDERED'),
(12, 80, 'RECEIVED'),
(13, 40, 'PENDING'),
(14, 60, 'ORDERED'),
(15, 25, 'RECEIVED');

INSERT INTO Users (FullName, Email, Password, Role)
VALUES ('Admin', 'admin@pharmacare.com', 'admin123', 'admin');
GO

-- (2) DELETE
DELETE FROM Restock WHERE ReorderID = 3;                              
DELETE FROM Restock WHERE ReorderID = 7;                       
DELETE FROM Restock WHERE ReorderID = 12;  

DELETE FROM Transactions WHERE TransactionID = 2;                  
DELETE FROM Transactions WHERE TransactionID = 9;             
DELETE FROM Transactions WHERE TransactionID = 14;  

DELETE FROM Sales WHERE SaleID = 2;                                
DELETE FROM Sales WHERE SaleID = 14;                     
DELETE FROM Sales WHERE SaleID = 9;     

DELETE FROM Medicines WHERE MedicineID = 5;                         
DELETE FROM Medicines WHERE MedicineID = 10;               
DELETE FROM Medicines WHERE MedicineID = 13;  

DELETE FROM Customers WHERE CustomerID = 2;                        
DELETE FROM Customers WHERE CustomerID = 6;               
DELETE FROM Customers WHERE CustomerID = 14;  

DELETE FROM Suppliers WHERE SupplierID = 3;
DELETE FROM Suppliers WHERE SupplierID = 8;                      
DELETE FROM Suppliers WHERE SupplierID = 11;

DELETE FROM Categories WHERE CategoryID = 4;                      
DELETE FROM Categories WHERE CategoryID = 9;         
DELETE FROM Categories WHERE CategoryID = 13;

-- (3) UPDATE
UPDATE Categories 
SET Description = 'Medicines for pain relief and fever reduction' 
WHERE CategoryID = 2;
UPDATE Categories 
SET CategoryName = 'Gut Health' 
WHERE CategoryID = 6;

UPDATE Customers 
SET Email = 'saood.updated@email.com' 
WHERE CustomerID = 3;
UPDATE Customers 
SET Phone = '03219876543' 
WHERE CustomerID = 5;

UPDATE Suppliers 
SET Phone = '03001112233' 
WHERE SupplierID = 1;
UPDATE Suppliers 
SET Address = 'Islamabad' 
WHERE SupplierID = 4;

UPDATE Medicines 
SET Price = 175.00 
WHERE MedicineID = 2;
UPDATE Medicines 
SET StockLevel = 250 
WHERE MedicineID = 4;

UPDATE Sales 
SET TotalAmount = 550.00 
WHERE SaleID = 3;
UPDATE Sales 
SET QuantitySold = 6 
WHERE SaleID = 6;

UPDATE Transactions 
SET Notes = 'Updated sale note for Vitamin C' 
WHERE TransactionID = 3;
UPDATE Transactions 
SET TransactionType = 'RESTOCK' 
WHERE TransactionID = 5;

UPDATE Restock 
SET Status = 'RECEIVED' 
WHERE ReorderID = 4;
UPDATE Restock 
SET ReorderQuantity = 90 
WHERE ReorderID = 5;

-- (4) (5) (6) SELECT WHERE LIKE
SELECT * FROM Categories 
WHERE CategoryID = 1;
SELECT CategoryName, Description 
FROM Categories
WHERE CategoryName LIKE '%care%';

SELECT * FROM Customers 
WHERE CustomerID = 3;
SELECT CustomerName, Phone 
FROM Customers 
WHERE Phone LIKE '03%';

SELECT * FROM Suppliers 
WHERE SupplierID = 2;
SELECT SupplierName, Address 
FROM Suppliers 
WHERE Address = 'Karachi';

SELECT * FROM Medicines 
WHERE MedicineID = 6;
SELECT MedicineName, Price, StockLevel 
FROM Medicines 
WHERE Price > 300.00;

SELECT * FROM Sales 
WHERE SaleID = 5;
SELECT SaleID, QuantitySold, TotalAmount 
FROM Sales 
WHERE TotalAmount > 500.00;

SELECT * FROM Transactions 
WHERE TransactionID = 4;
SELECT TransactionID, TransactionType, Quantity 
FROM Transactions 
WHERE TransactionType = 'RESTOCK';

SELECT * FROM Restock 
WHERE ReorderID = 2;
SELECT ReorderID, ReorderQuantity, Status
FROM Restock 
WHERE Status = 'ORDERED';

-- (7) (8) (9) GROUP BY HAVING AGGREGATE FUNCTIONS
SELECT CategoryID, COUNT(*) AS TotalMedicines 
FROM Medicines 
GROUP BY CategoryID 
HAVING COUNT(*) > 1;
SELECT CategoryID, AVG(Price) AS AvgPrice 
FROM Medicines 
GROUP BY CategoryID 
HAVING AVG(Price) > 200.00;

SELECT CustomerID, COUNT(*) AS TotalPurchases 
FROM Sales 
GROUP BY CustomerID 
HAVING COUNT(*) > 1;
SELECT CustomerID, SUM(TotalAmount) AS TotalSpent 
FROM Sales 
GROUP BY CustomerID 
HAVING SUM(TotalAmount) > 500.00;

SELECT SupplierID, COUNT(*) AS TotalMedicinesSupplied 
FROM Medicines 
GROUP BY SupplierID 
HAVING COUNT(*) > 1;
SELECT SupplierID, AVG(Price) AS AvgMedicinePrice 
FROM Medicines 
GROUP BY SupplierID 
HAVING AVG(Price) > 150.00;

SELECT MedicineID, SUM(QuantitySold) AS TotalSold 
FROM Sales 
GROUP BY MedicineID 
HAVING SUM(QuantitySold) > 2;
SELECT MedicineID, MAX(Price) AS MaxPrice 
FROM Medicines 
GROUP BY MedicineID 
HAVING MAX(Price) > 300.00;

SELECT MedicineID, SUM(TotalAmount) AS TotalRevenue 
FROM Sales 
GROUP BY MedicineID 
HAVING SUM(TotalAmount) > 400.00;
SELECT CustomerID, COUNT(*) AS TotalSales 
FROM Sales 
GROUP BY CustomerID 
HAVING COUNT(*) >= 1;

SELECT TransactionType, SUM(Quantity) AS TotalQuantity 
FROM Transactions 
GROUP BY TransactionType 
HAVING SUM(Quantity) > 5;
SELECT MedicineID, COUNT(*) AS TotalTransactions 
FROM Transactions 
GROUP BY MedicineID 
HAVING COUNT(*) > 1;

SELECT Status, COUNT(*) AS TotalOrders 
FROM Restock 
GROUP BY Status 
HAVING COUNT(*) > 1;
SELECT MedicineID, SUM(ReorderQuantity) AS TotalReordered 
FROM Restock 
GROUP BY MedicineID 
HAVING SUM(ReorderQuantity) > 30;

-- (10) UNION ORDER BY
SELECT CustomerName AS Name, Email FROM Customers
UNION
SELECT SupplierName AS Name, Email FROM Suppliers
ORDER BY Name ASC;

SELECT CustomerName AS Name, Phone FROM Customers
UNION
SELECT SupplierName AS Name, Phone FROM Suppliers
ORDER BY Name DESC;

SELECT CategoryName AS Name, Description AS Detail FROM Categories
UNION
SELECT SupplierName AS Name, Address AS Detail FROM Suppliers
ORDER BY Name ASC;

SELECT CategoryName AS Name, Description AS Detail FROM Categories
UNION
SELECT CustomerName AS Name, Email AS Detail FROM Customers
ORDER BY Detail DESC;

-- (11) INTERSECT ORDER BY
SELECT MedicineID FROM Medicines
INTERSECT
SELECT MedicineID FROM Sales
ORDER BY MedicineID ASC;

SELECT MedicineID FROM Medicines
INTERSECT
SELECT MedicineID FROM Transactions
ORDER BY MedicineID DESC;

SELECT MedicineID FROM Sales
INTERSECT
SELECT MedicineID FROM Restock
ORDER BY MedicineID ASC;

SELECT MedicineID FROM Sales
INTERSECT
SELECT MedicineID FROM Transactions
ORDER BY MedicineID DESC;

SELECT MedicineID FROM Transactions
INTERSECT
SELECT MedicineID FROM Restock
ORDER BY MedicineID ASC;

SELECT MedicineID FROM Restock
INTERSECT
SELECT MedicineID FROM Medicines
ORDER BY MedicineID DESC;

-- (12) EXCEPT ORDER BY
SELECT MedicineID FROM Medicines
EXCEPT
SELECT MedicineID FROM Sales
ORDER BY MedicineID ASC;

SELECT MedicineID FROM Medicines
EXCEPT
SELECT MedicineID FROM Restock
ORDER BY MedicineID DESC;

SELECT CustomerID FROM Customers
EXCEPT
SELECT CustomerID FROM Sales
ORDER BY CustomerID ASC;

SELECT SupplierID FROM Suppliers
EXCEPT
SELECT SupplierID FROM Medicines
ORDER BY SupplierID DESC;

-- (14) JOIN
SELECT m.MedicineName, c.CategoryName 
FROM Medicines m
JOIN Categories c ON m.CategoryID = c.CategoryID;

SELECT m.MedicineName, s.SupplierName, s.Address 
FROM Medicines m
JOIN Suppliers s ON m.SupplierID = s.SupplierID;

SELECT s.SaleID, c.CustomerName, m.MedicineName, s.TotalAmount 
FROM Sales s
JOIN Customers c ON s.CustomerID = c.CustomerID
JOIN Medicines m ON s.MedicineID = m.MedicineID;

-- (15) LEFT JOIN
SELECT c.CustomerName, s.SaleID, s.TotalAmount 
FROM Customers c
LEFT JOIN Sales s ON c.CustomerID = s.CustomerID;

SELECT m.MedicineName, r.ReorderQuantity, r.Status 
FROM Medicines m
LEFT JOIN Restock r ON m.MedicineID = r.MedicineID;

SELECT m.MedicineName, t.TransactionType, t.Quantity 
FROM Medicines m
LEFT JOIN Transactions t ON m.MedicineID = t.MedicineID;

-- (16) RIGHT JOIN
SELECT c.CustomerName, s.SaleID, s.TotalAmount 
FROM Sales s
RIGHT JOIN Customers c ON s.CustomerID = c.CustomerID;

SELECT m.MedicineName, r.ReorderQuantity, r.Status 
FROM Restock r
RIGHT JOIN Medicines m ON r.MedicineID = m.MedicineID;

SELECT t.TransactionType, t.Quantity, m.MedicineName 
FROM Transactions t
RIGHT JOIN Medicines m ON t.MedicineID = m.MedicineID;

-- (17) OUTER JOIN
SELECT c.CustomerName, s.SaleID, s.TotalAmount 
FROM Customers c
FULL OUTER JOIN Sales s ON c.CustomerID = s.CustomerID;

SELECT m.MedicineName, r.ReorderQuantity, r.Status 
FROM Medicines m
FULL OUTER JOIN Restock r ON m.MedicineID = r.MedicineID;

SELECT m.MedicineName, t.TransactionType, t.Quantity 
FROM Medicines m
FULL OUTER JOIN Transactions t ON m.MedicineID = t.MedicineID;

-- (18) SUBQUERIES
SELECT CategoryName 
FROM Categories 
WHERE CategoryID IN (SELECT CategoryID FROM Medicines);

SELECT CategoryName 
FROM Categories 
WHERE CategoryID NOT IN (SELECT CategoryID 
                        FROM Medicines 
                        WHERE StockLevel > 100);

SELECT CustomerName 
FROM Customers 
WHERE CustomerID IN (SELECT CustomerID FROM Sales);

SELECT CustomerName, Phone
FROM Customers 
WHERE CustomerID IN (SELECT CustomerID FROM Sales 
                    WHERE TotalAmount = (SELECT MAX(TotalAmount) FROM Sales));

SELECT SupplierName 
FROM Suppliers 
WHERE SupplierID IN (SELECT SupplierID FROM Medicines);

SELECT SupplierName, Address
FROM Suppliers 
WHERE SupplierID NOT IN (SELECT SupplierID 
                        FROM Medicines 
                        WHERE ExpiryDate < '2027-01-01');

SELECT MedicineName 
FROM Medicines 
WHERE StockLevel < MinimumStockLevel;

SELECT MedicineName, Price
FROM Medicines 
WHERE MedicineID IN (SELECT MedicineID FROM Sales 
                    WHERE QuantitySold = (SELECT MAX(QuantitySold) FROM Sales));

SELECT SaleID, TotalAmount 
FROM Sales 
WHERE QuantitySold > (SELECT MIN(QuantitySold) FROM Sales);

SELECT SaleID, TotalAmount, QuantitySold
FROM Sales 
WHERE MedicineID IN (SELECT MedicineID 
                    FROM Medicines 
                    WHERE ExpiryDate = (SELECT MAX(ExpiryDate) FROM Medicines));

SELECT TransactionID, TransactionType 
FROM Transactions 
WHERE Quantity > (SELECT MIN(Quantity) FROM Transactions);

SELECT TransactionID, Quantity, Notes
FROM Transactions 
WHERE SaleID IN (SELECT SaleID 
                FROM Sales 
                WHERE CustomerID = (SELECT CustomerID 
                                    FROM Customers 
                                    WHERE CustomerName = 'Hamza Ali'));

SELECT ReorderID, Status 
FROM Restock 
WHERE ReorderQuantity > (SELECT MIN(ReorderQuantity) FROM Restock);

SELECT ReorderID, ReorderQuantity, Status
FROM Restock 
WHERE MedicineID IN (SELECT MedicineID 
                    FROM Medicines 
                    WHERE SupplierID = (SELECT SupplierID 
                                        FROM Suppliers 
                                        WHERE SupplierName = 'MediSupply Pvt Ltd'));


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

SELECT * from vw_ExpiredMedicines

-- ============================================================
--  PharmaCare Inventory Management System
--  All Stored Procedures & Triggers — v2 (fully updated)
--  Run this entire file in SSMS against PharmacyInventoryDB
-- ============================================================

-- ============================================================
--  FIX: Update Restock Status constraint to allow
--       APPROVED and CANCELLED in addition to old values
-- ============================================================
IF EXISTS (
SELECT 1 FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_NAME = 'CK__Restock__Status__787EE5A0'
)
BEGIN
ALTER TABLE Restock DROP CONSTRAINT CK__Restock__Status__787EE5A0;
END
GO

IF EXISTS (
SELECT 1 FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_NAME = 'CK_Restock_Status'
)
BEGIN
ALTER TABLE Restock DROP CONSTRAINT CK_Restock_Status;
END
GO

ALTER TABLE Restock
ADD CONSTRAINT CK_Restock_Status
CHECK (Status IN ('PENDING', 'APPROVED', 'CANCELLED', 'ORDERED', 'RECEIVED'));
GO

-- ============================================================
--  FIX: Allow NULL in Transactions.SaleID
--       so restock entries don't require a SaleID
-- ============================================================
ALTER TABLE Transactions
ALTER COLUMN SaleID INT NULL;
GO


-- ============================================================
--  1. sp_LoginUser
-- ============================================================
DROP PROCEDURE IF EXISTS sp_LoginUser;
GO

CREATE PROCEDURE sp_LoginUser
@Email VARCHAR(100),
@Password VARCHAR(100)
AS
BEGIN
SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
BEGIN
    RAISERROR('Email not found', 16, 1)
    RETURN
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = @Email AND Password = @Password)
BEGIN
    RAISERROR('Incorrect password', 16, 1)
    RETURN
END

SELECT UserID, FullName, Email, Role
FROM Users
WHERE Email = @Email AND Password = @Password
END
GO


-- ============================================================
--  2. sp_RegisterUser
-- ============================================================
DROP PROCEDURE IF EXISTS sp_RegisterUser;
GO

CREATE PROCEDURE sp_RegisterUser
@FullName VARCHAR(100),
@Email VARCHAR(100),
@Password VARCHAR(100),
@Role VARCHAR(20) = 'staff'
AS
BEGIN
SET NOCOUNT ON;

IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
BEGIN
    RAISERROR('Email already registered', 16, 1)
    RETURN
END

IF @Role NOT IN ('staff', 'admin')
BEGIN
    RAISERROR('Invalid role. Must be staff or admin', 16, 1)
    RETURN
END

INSERT INTO Users (FullName, Email, Password, Role)
VALUES (@FullName, @Email, @Password, @Role)

SELECT UserID, FullName, Email, Role
FROM Users
WHERE Email = @Email
END
GO


-- ============================================================
--  3. sp_AddMedicine
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddMedicine;
GO

CREATE PROCEDURE sp_AddMedicine
@MedicineName VARCHAR(100),
@CategoryID INT,
@SupplierID INT,
@BatchNumber VARCHAR(50),
@ExpiryDate DATE,
@Price DECIMAL(10,2),
@StockLevel INT,
@MinimumStockLevel INT = 10
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF @MedicineName IS NULL OR LEN(LTRIM(RTRIM(@MedicineName))) = 0
    BEGIN
        ROLLBACK
        RAISERROR('Medicine name cannot be empty', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM Medicines WHERE MedicineName = @MedicineName)
    BEGIN
        ROLLBACK
        RAISERROR('Medicine with this name already exists', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM Categories WHERE CategoryID = @CategoryID)
    BEGIN
        ROLLBACK
        RAISERROR('Category not found', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM Suppliers WHERE SupplierID = @SupplierID)
    BEGIN
        ROLLBACK
        RAISERROR('Supplier not found', 16, 1)
        RETURN
    END

    IF @Price <= 0
    BEGIN
        ROLLBACK
        RAISERROR('Price must be greater than 0', 16, 1)
        RETURN
    END

    IF @StockLevel < 0
    BEGIN
        ROLLBACK
        RAISERROR('Stock level cannot be negative', 16, 1)
        RETURN
    END

    IF @ExpiryDate <= GETDATE()
    BEGIN
        ROLLBACK
        RAISERROR('Expiry date must be in the future', 16, 1)
        RETURN
    END

    INSERT INTO Medicines
        (MedicineName, CategoryID, SupplierID, BatchNumber, ExpiryDate, Price, StockLevel, MinimumStockLevel)
    VALUES
        (@MedicineName, @CategoryID, @SupplierID, @BatchNumber, @ExpiryDate, @Price, @StockLevel, @MinimumStockLevel)

    -- Auto create restock order if stock is already below minimum
    IF @StockLevel < @MinimumStockLevel
    BEGIN
        DECLARE @NewMedicineID INT = SCOPE_IDENTITY()
        INSERT INTO Restock (MedicineID, ReorderQuantity, Status)
        VALUES (@NewMedicineID, @MinimumStockLevel - @StockLevel, 'PENDING')
    END

    COMMIT
    SELECT 'Medicine added successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while adding medicine', 16, 1)
    RETURN
END CATCH
END
GO


-- ============================================================
--  4. sp_UpdateMedicine
-- ============================================================
DROP PROCEDURE IF EXISTS sp_UpdateMedicine;
GO

CREATE PROCEDURE sp_UpdateMedicine
@MedicineID INT,
@MedicineName VARCHAR(100),
@CategoryID INT,
@SupplierID INT,
@BatchNumber VARCHAR(50),
@ExpiryDate DATE,
@Price DECIMAL(10,2),
@StockLevel INT,
@MinimumStockLevel INT
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Medicines WHERE MedicineID = @MedicineID)
    BEGIN
        ROLLBACK
        RAISERROR('Medicine not found', 16, 1)
        RETURN
    END

    IF EXISTS (
        SELECT 1 FROM Medicines
        WHERE MedicineName = @MedicineName
        AND MedicineID != @MedicineID
    )
    BEGIN
        ROLLBACK
        RAISERROR('Another medicine with this name already exists', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM Categories WHERE CategoryID = @CategoryID)
    BEGIN
        ROLLBACK
        RAISERROR('Category not found', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM Suppliers WHERE SupplierID = @SupplierID)
    BEGIN
        ROLLBACK
        RAISERROR('Supplier not found', 16, 1)
        RETURN
    END

    IF @Price <= 0
    BEGIN
        ROLLBACK
        RAISERROR('Price must be greater than 0', 16, 1)
        RETURN
    END

    IF @StockLevel < 0
    BEGIN
        ROLLBACK
        RAISERROR('Stock level cannot be negative', 16, 1)
        RETURN
    END

    -- No expiry date check on update — old medicines may have past dates

    UPDATE Medicines
    SET
        MedicineName      = @MedicineName,
        CategoryID        = @CategoryID,
        SupplierID        = @SupplierID,
        BatchNumber       = @BatchNumber,
        ExpiryDate        = @ExpiryDate,
        Price             = @Price,
        StockLevel        = @StockLevel,
        MinimumStockLevel = @MinimumStockLevel
    WHERE MedicineID = @MedicineID

    COMMIT
    SELECT 'Medicine updated successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while updating medicine', 16, 1)
    RETURN
END CATCH
END
GO


-- ============================================================
--  5. sp_DeleteMedicine
-- ============================================================
DROP PROCEDURE IF EXISTS sp_DeleteMedicine;
GO

CREATE PROCEDURE sp_DeleteMedicine
@MedicineID INT,
@Force BIT = 0
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Medicines WHERE MedicineID = @MedicineID)
    BEGIN
        ROLLBACK
        RAISERROR('Medicine not found', 16, 1)
        RETURN
    END

    -- Block delete if medicine has pending restock orders
    IF EXISTS (
        SELECT 1 FROM Restock
        WHERE MedicineID = @MedicineID
        AND Status = 'PENDING'
    )
    BEGIN
        ROLLBACK
        RAISERROR('Cannot delete medicine — it has pending restock orders. Approve or cancel them first.', 16, 1)
        RETURN
    END

    -- If not forcing, warn about sales history
    IF @Force = 0 AND EXISTS (SELECT 1 FROM Sales WHERE MedicineID = @MedicineID)
    BEGIN
        ROLLBACK
        RAISERROR('Medicine has sales history. Pass @Force = 1 to confirm deletion.', 16, 1)
        RETURN
    END

    -- Force delete: remove related records first
    IF @Force = 1
    BEGIN
        DELETE FROM Transactions WHERE MedicineID = @MedicineID
        DELETE FROM Sales WHERE MedicineID = @MedicineID
        DELETE FROM Restock WHERE MedicineID = @MedicineID
    END

    DELETE FROM Medicines WHERE MedicineID = @MedicineID

    COMMIT
    SELECT 'Medicine deleted successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while deleting medicine', 16, 1)
    RETURN
END CATCH
END
GO


-- ============================================================
--  6. sp_RecordSale
-- ============================================================
DROP PROCEDURE IF EXISTS sp_RecordSale;
GO

CREATE PROCEDURE sp_RecordSale
@CustomerID INT,
@MedicineID INT,
@QuantitySold INT,
@TotalAmount DECIMAL(10,2)
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Customers WHERE CustomerID = @CustomerID)
    BEGIN
        ROLLBACK
        RAISERROR('Customer not found', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM Medicines WHERE MedicineID = @MedicineID)
    BEGIN
        ROLLBACK
        RAISERROR('Medicine not found', 16, 1)
        RETURN
    END

    IF @QuantitySold <= 0
    BEGIN
        ROLLBACK
        RAISERROR('Quantity must be greater than 0', 16, 1)
        RETURN
    END

    IF @TotalAmount <= 0
    BEGIN
        ROLLBACK
        RAISERROR('Total amount must be greater than 0', 16, 1)
        RETURN
    END

    IF (SELECT StockLevel FROM Medicines WHERE MedicineID = @MedicineID) < @QuantitySold
    BEGIN
        ROLLBACK
        RAISERROR('Insufficient stock for this medicine', 16, 1)
        RETURN
    END

    -- Insert sale
    INSERT INTO Sales (MedicineID, CustomerID, QuantitySold, TotalAmount)
    VALUES (@MedicineID, @CustomerID, @QuantitySold, @TotalAmount)

    -- Deduct stock
    UPDATE Medicines
    SET StockLevel = StockLevel - @QuantitySold
    WHERE MedicineID = @MedicineID

    COMMIT
    SELECT 'Sale recorded successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while recording sale', 16, 1)
    RETURN
END CATCH
END
GO


-- ============================================================
--  7. sp_RestockMedicine
-- ============================================================
DROP PROCEDURE IF EXISTS sp_RestockMedicine;
GO

CREATE PROCEDURE sp_RestockMedicine
@MedicineID INT,
@ReorderQuantity INT
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Medicines WHERE MedicineID = @MedicineID)
    BEGIN
        ROLLBACK
        RAISERROR('Medicine not found', 16, 1)
        RETURN
    END

    IF @ReorderQuantity <= 0
    BEGIN
        ROLLBACK
        RAISERROR('Reorder quantity must be greater than 0', 16, 1)
        RETURN
    END

    INSERT INTO Restock (MedicineID, ReorderQuantity, Status)
    VALUES (@MedicineID, @ReorderQuantity, 'PENDING')

    COMMIT
    SELECT 'Restock order created successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while creating restock order', 16, 1)
    RETURN
END CATCH
END
GO

-- ============================================================
--  8. sp_ApproveRestock  ← FIXED: constraint + TRY/CATCH
-- ============================================================
DROP PROCEDURE IF EXISTS sp_ApproveRestock;
GO
CREATE PROCEDURE sp_ApproveRestock
@ReorderID INT
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Restock WHERE ReorderID = @ReorderID)
    BEGIN
        ROLLBACK
        RAISERROR('Restock order not found', 16, 1)
        RETURN
    END

    IF (SELECT Status FROM Restock WHERE ReorderID = @ReorderID) = 'RECEIVED'
    BEGIN
        ROLLBACK
        RAISERROR('Restock order already approved', 16, 1)
        RETURN
    END

    IF (SELECT Status FROM Restock WHERE ReorderID = @ReorderID) != 'PENDING'
    BEGIN
        ROLLBACK
        RAISERROR('Only PENDING restock orders can be approved', 16, 1)
        RETURN
    END

    DECLARE @MedicineID INT
    DECLARE @ReorderQuantity INT

    SELECT @MedicineID = MedicineID, @ReorderQuantity = ReorderQuantity
    FROM Restock
    WHERE ReorderID = @ReorderID

    UPDATE Restock
    SET Status = 'RECEIVED'
    WHERE ReorderID = @ReorderID

    UPDATE Medicines
    SET StockLevel = StockLevel + @ReorderQuantity
    WHERE MedicineID = @MedicineID

    COMMIT
    SELECT 'Restock approved and stock updated' AS Message
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK
    DECLARE @err NVARCHAR(500) = ERROR_MESSAGE()
    RAISERROR(@err, 16, 1)
    RETURN
END CATCH
END
GO

-- ============================================================
--  9. sp_CancelRestock  ← FIXED: constraint + TRY/CATCH
-- ============================================================
DROP PROCEDURE IF EXISTS sp_CancelRestock;
GO
CREATE PROCEDURE sp_CancelRestock
@ReorderID INT
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM Restock WHERE ReorderID = @ReorderID)
    BEGIN
        ROLLBACK
        RAISERROR('Restock order not found', 16, 1)
        RETURN
    END

    IF (SELECT Status FROM Restock WHERE ReorderID = @ReorderID) != 'PENDING'
    BEGIN
        ROLLBACK
        RAISERROR('Only PENDING restock orders can be cancelled', 16, 1)
        RETURN
    END

    UPDATE Restock
    SET Status = 'ORDERED'
    WHERE ReorderID = @ReorderID

    COMMIT
    SELECT 'Restock order cancelled' AS Message
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK
    DECLARE @err NVARCHAR(500) = ERROR_MESSAGE()
    RAISERROR(@err, 16, 1)
    RETURN
END CATCH
END
GO

-- ============================================================
--  10. sp_AddCustomer
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddCustomer;
GO

CREATE PROCEDURE sp_AddCustomer
@CustomerName VARCHAR(100),
@Phone VARCHAR(20),
@Email VARCHAR(100)
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF @CustomerName IS NULL OR LEN(LTRIM(RTRIM(@CustomerName))) = 0
    BEGIN
        ROLLBACK
        RAISERROR('Customer name cannot be empty', 16, 1)
        RETURN
    END

    IF LEN(@Phone) > 0 AND EXISTS (SELECT 1 FROM Customers WHERE Phone = @Phone)
    BEGIN
        ROLLBACK
        RAISERROR('A customer with this phone number already exists', 16, 1)
        RETURN
    END

    IF LEN(@Email) > 0 AND EXISTS (SELECT 1 FROM Customers WHERE Email = @Email)
    BEGIN
        ROLLBACK
        RAISERROR('A customer with this email already exists', 16, 1)
        RETURN
    END

    INSERT INTO Customers (CustomerName, Phone, Email)
    VALUES (@CustomerName, @Phone, @Email)

    COMMIT
    SELECT 'Customer added successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while adding customer', 16, 1)
    RETURN
END CATCH
END
GO


-- ============================================================
--  11. sp_AddSupplier
-- ============================================================
DROP PROCEDURE IF EXISTS sp_AddSupplier;
GO

CREATE PROCEDURE sp_AddSupplier
@SupplierName VARCHAR(100),
@Phone VARCHAR(20),
@Email VARCHAR(100),
@Address VARCHAR(255)
AS
BEGIN
SET NOCOUNT ON;

BEGIN TRANSACTION
BEGIN TRY
    IF @SupplierName IS NULL OR LEN(LTRIM(RTRIM(@SupplierName))) = 0
    BEGIN
        ROLLBACK
        RAISERROR('Supplier name cannot be empty', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM Suppliers WHERE SupplierName = @SupplierName)
    BEGIN
        ROLLBACK
        RAISERROR('Supplier with this name already exists', 16, 1)
        RETURN
    END

    IF LEN(@Phone) > 0 AND EXISTS (SELECT 1 FROM Suppliers WHERE Phone = @Phone)
    BEGIN
        ROLLBACK
        RAISERROR('A supplier with this phone number already exists', 16, 1)
        RETURN
    END

    INSERT INTO Suppliers (SupplierName, Phone, Email, Address)
    VALUES (@SupplierName, @Phone, @Email, @Address)

    COMMIT
    SELECT 'Supplier added successfully' AS Message
END TRY
BEGIN CATCH
    ROLLBACK
    RAISERROR('An error occurred while adding supplier', 16, 1)
    RETURN
END CATCH
END
GO


-- ============================================================
--  12. sp_GetDashboard
-- ============================================================
DROP PROCEDURE IF EXISTS sp_GetDashboard;
GO

CREATE PROCEDURE sp_GetDashboard
AS
BEGIN
SET NOCOUNT ON;

SELECT
    (SELECT COUNT(*) FROM Medicines) AS totalMedicines,
    (SELECT COUNT(*) FROM Sales) AS totalSales,
    (SELECT ISNULL(SUM(TotalAmount), 0) FROM Sales) AS totalRevenue,
    (SELECT COUNT(*) FROM Medicines
        WHERE StockLevel < MinimumStockLevel) AS lowStockCount,
    (SELECT COUNT(*) FROM Restock
        WHERE Status = 'PENDING') AS pendingRestock,
    (SELECT COUNT(*) FROM Customers) AS totalCustomers,
    (SELECT COUNT(*) FROM Suppliers) AS totalSuppliers,
    (SELECT ISNULL(SUM(TotalAmount), 0) FROM Sales
        WHERE MONTH(SaleDate) = MONTH(GETDATE())
        AND YEAR(SaleDate) = YEAR(GETDATE())) AS revenueThisMonth,
    (SELECT COUNT(*) FROM Sales
        WHERE CAST(SaleDate AS DATE) = CAST(GETDATE() AS DATE)) AS salesToday
END
GO


-- ============================================================
--  TRIGGERS  ← FIXED: SaleID column included correctly
-- ============================================================

IF OBJECT_ID('trg_LogSale', 'TR') IS NOT NULL
DROP TRIGGER trg_LogSale;
GO

IF OBJECT_ID('trg_LogRestock', 'TR') IS NOT NULL
DROP TRIGGER trg_LogRestock;
GO

-- Trigger: auto log every new sale into Transactions
-- SaleID is taken from the inserted sale row
CREATE TRIGGER trg_LogSale
ON Sales
AFTER INSERT
AS
BEGIN
SET NOCOUNT ON;
INSERT INTO Transactions (MedicineID, SaleID, TransactionType, Quantity, Notes, TransactionDate)
SELECT
    i.MedicineID,
    i.SaleID,
    'SALE',
    i.QuantitySold,
    'Sale recorded automatically',
    GETDATE()
FROM inserted i
END
GO

-- Trigger: auto log every approved restock into Transactions
-- SaleID is NULL for restock entries since there is no sale involved
CREATE TRIGGER trg_LogRestock
ON Restock
AFTER UPDATE
AS
BEGIN
SET NOCOUNT ON;
INSERT INTO Transactions (MedicineID, SaleID, TransactionType, Quantity, Notes, TransactionDate)
SELECT
    i.MedicineID,
    NULL,
    'RESTOCK',
    i.ReorderQuantity,
    'Restock approved automatically',
    GETDATE()
FROM inserted i
JOIN deleted d ON i.ReorderID = d.ReorderID
WHERE i.Status = 'APPROVED' AND d.Status != 'APPROVED'
END
GO


-- ============================================================
--  VERIFY — list all created procedures and triggers
-- ============================================================
SELECT name, type_desc, create_date
FROM sys.objects
WHERE type IN ('P', 'TR')
AND name IN (
'sp_LoginUser', 'sp_RegisterUser',
'sp_AddMedicine', 'sp_UpdateMedicine', 'sp_DeleteMedicine',
'sp_RecordSale',
'sp_RestockMedicine', 'sp_ApproveRestock', 'sp_CancelRestock',
'sp_AddCustomer', 'sp_AddSupplier',
'sp_GetDashboard',
'trg_LogSale', 'trg_LogRestock'
)
ORDER BY type_desc, name;
GO
