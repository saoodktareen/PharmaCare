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
-- Users table for login/signup
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