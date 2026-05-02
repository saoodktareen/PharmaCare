-- ============================================================
--  PharmaCare Inventory Management System
--  All Stored Procedures & Triggers
--  Run this entire file in SSMS against PharmacyInventoryDB
-- ============================================================

USE PharmacyInventoryDB;
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

        IF (SELECT StockLevel FROM Medicines WHERE MedicineID = @MedicineID) < @QuantitySold
        BEGIN
            ROLLBACK
            RAISERROR('Insufficient stock for this medicine', 16, 1)
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
--  8. sp_ApproveRestock
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

        IF (SELECT Status FROM Restock WHERE ReorderID = @ReorderID) = 'APPROVED'
        BEGIN
            ROLLBACK
            RAISERROR('Restock order already approved', 16, 1)
            RETURN
        END

        IF (SELECT Status FROM Restock WHERE ReorderID = @ReorderID) = 'CANCELLED'
        BEGIN
            ROLLBACK
            RAISERROR('Cannot approve a cancelled restock order', 16, 1)
            RETURN
        END

        DECLARE @MedicineID INT
        DECLARE @ReorderQuantity INT

        SELECT @MedicineID = MedicineID, @ReorderQuantity = ReorderQuantity
        FROM Restock
        WHERE ReorderID = @ReorderID

        UPDATE Restock
        SET Status = 'APPROVED'
        WHERE ReorderID = @ReorderID

        UPDATE Medicines
        SET StockLevel = StockLevel + @ReorderQuantity
        WHERE MedicineID = @MedicineID

        COMMIT
        SELECT 'Restock approved and stock updated' AS Message
    END TRY
    BEGIN CATCH
        ROLLBACK
        RAISERROR('An error occurred while approving restock', 16, 1)
        RETURN
    END CATCH
END
GO


-- ============================================================
--  9. sp_CancelRestock
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
        SET Status = 'CANCELLED'
        WHERE ReorderID = @ReorderID

        COMMIT
        SELECT 'Restock order cancelled' AS Message
    END TRY
    BEGIN CATCH
        ROLLBACK
        RAISERROR('An error occurred while cancelling restock', 16, 1)
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
--  TRIGGERS
-- ============================================================

-- Drop triggers if they already exist
IF OBJECT_ID('trg_LogSale', 'TR') IS NOT NULL
    DROP TRIGGER trg_LogSale;
GO

IF OBJECT_ID('trg_LogRestock', 'TR') IS NOT NULL
    DROP TRIGGER trg_LogRestock;
GO

-- Trigger: auto log every new sale into Transactions
CREATE TRIGGER trg_LogSale
ON Sales
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Transactions (MedicineID, TransactionType, Quantity, Notes, TransactionDate)
    SELECT
        MedicineID,
        'SALE',
        QuantitySold,
        'Sale recorded automatically',
        GETDATE()
    FROM inserted
END
GO

-- Trigger: auto log every approved restock into Transactions
CREATE TRIGGER trg_LogRestock
ON Restock
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Transactions (MedicineID, TransactionType, Quantity, Notes, TransactionDate)
    SELECT
        i.MedicineID,
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