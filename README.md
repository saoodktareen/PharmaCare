# 💊 PharmaCare — Pharmacy Inventory Management System

A full-stack pharmacy inventory management system built with **React**, **Node.js/Express**, and **Microsoft SQL Server**. Designed to manage medicines, sales, suppliers, customers, restock orders, and transactions with role-based access control for admins and staff.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
- [Stored Procedures](#stored-procedures)
- [Views](#views)
- [Triggers](#triggers)
- [Role-Based Access](#role-based-access)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## Overview

PharmaCare is a comprehensive inventory management system built for pharmacies. It allows staff to record sales and view stock, while admins have full control over medicines, suppliers, pricing, users, and financial reports. The backend uses stored procedures and transactions in SQL Server to ensure data integrity across all operations.

---

## Features

### 👤 Authentication
- Secure login and registration system
- Role-based access — Admin and Staff
- Session-based authentication (clears on browser close)

### 💊 Medicines
- View all medicines with category, supplier, stock status
- Add, edit, delete medicines (Admin only)
- Auto stock status — Low Stock, Expired, OK
- Auto restock order created if stock is below minimum on add

### 🛒 Sales
- Record sales for one or multiple medicines in a single transaction
- Auto-calculates total amount based on medicine price and quantity
- Stock level automatically deducted on each sale
- Stock validation — cannot sell more than available stock

### 📦 Restock
- Create restock orders for low stock medicines
- Admin can Approve (stock added) or Cancel orders
- Full restock history with supplier info

### 👥 Customers & Suppliers
- Add and manage customers and suppliers
- Duplicate phone/email validation

### 📊 Dashboard
- Real-time stats — total medicines, sales, revenue, low stock count
- Revenue this month and sales today
- Low stock alerts panel

### 📋 Transactions
- Auto-logged on every sale and restock approval via database triggers
- Full transaction history with medicine and category info

### 👥 User Management (Admin only)
- View all registered users with their roles

### 📈 Reports (Admin only)
- Revenue breakdown per medicine
- Expired medicines report

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | Microsoft SQL Server (SSMS 2022) |
| ORM/Driver | mssql (node-mssql) |
| Styling | CSS Variables + Plus Jakarta Sans font |
| Auth | Session Storage + Role Header |

---

## Database Design

### Tables

| Table | Description |
|---|---|
| `Users` | Login accounts with roles (admin/staff) |
| `Medicines` | Medicine inventory with pricing and stock |
| `Categories` | Medicine categories |
| `Suppliers` | Supplier contact information |
| `Customers` | Customer records |
| `Sales` | Sales transactions |
| `Transactions` | Auto-logged stock movements |
| `Restock` | Restock/reorder requests |

### Relationships
- `Medicines` → `Categories` (FK, SET NULL on delete)
- `Medicines` → `Suppliers` (FK, SET NULL on delete)
- `Sales` → `Medicines` (FK, CASCADE on delete)
- `Sales` → `Customers` (FK, SET NULL on delete)
- `Transactions` → `Medicines` (FK, CASCADE on delete)
- `Transactions` → `Sales` (FK, NO ACTION)
- `Restock` → `Medicines` (FK, CASCADE on delete)

---

## Stored Procedures

All business logic is handled through stored procedures in SQL Server. Every procedure uses transactions with `BEGIN TRANSACTION`, `COMMIT`, and `ROLLBACK` for data integrity.

| Procedure | Description |
|---|---|
| `sp_LoginUser` | Validates email and password, returns user record |
| `sp_RegisterUser` | Creates new user with role validation |
| `sp_AddMedicine` | Adds medicine with full validation + auto restock if low |
| `sp_UpdateMedicine` | Updates medicine details with duplicate name check |
| `sp_DeleteMedicine` | Deletes medicine, blocks if pending restocks exist |
| `sp_RecordSale` | Inserts sale + deducts stock in one transaction |
| `sp_RestockMedicine` | Creates a PENDING restock order |
| `sp_ApproveRestock` | Approves restock + adds stock to medicine |
| `sp_CancelRestock` | Cancels a PENDING restock order |
| `sp_AddCustomer` | Adds customer with phone/email duplicate check |
| `sp_AddSupplier` | Adds supplier with name/phone duplicate check |
| `sp_GetDashboard` | Returns all dashboard stats in a single query |

---

## Views

All complex JOIN queries are abstracted into database views.

| View | Used By | Extra Columns |
|---|---|---|
| `vw_MedicinesDetail` | Medicines page | `StockStatus` (Low Stock / Expired / OK) |
| `vw_LowStockMedicines` | Dashboard alerts | `UnitsNeeded` |
| `vw_SalesSummary` | Sales page | Joined customer and medicine names |
| `vw_RestockOrders` | Restock page | `SupplierName` |
| `vw_TransactionLog` | Transactions page | `CategoryName` |
| `vw_ExpiredMedicines` | Reports | `DaysExpired` |
| `vw_RevenueByMedicine` | Reports | `TotalRevenue`, `TotalUnitsSold` |

---

## Triggers

Two database triggers auto-log stock movements to the Transactions table.

**`trg_LogSale`** — fires after every INSERT on the Sales table:
```sql
-- Automatically logs a SALE transaction entry
-- with MedicineID, SaleID, quantity, and timestamp
```

**`trg_LogRestock`** — fires after every UPDATE on the Restock table:
```sql
-- Automatically logs a RESTOCK transaction entry
-- when Status changes from PENDING to APPROVED
```

---

## Role-Based Access

| Feature | Staff | Admin |
|---|---|---|
| View dashboard | ✅ | ✅ |
| View medicines | ✅ | ✅ |
| Add / Edit / Delete medicines | ❌ | ✅ |
| Modify pricing | ❌ | ✅ |
| Record sales | ✅ | ✅ |
| View customers | ✅ | ✅ |
| View suppliers | ❌ | ✅ |
| Add suppliers | ❌ | ✅ |
| View restock orders | ✅ | ✅ |
| Approve / Cancel restock | ❌ | ✅ |
| View transactions | ❌ | ✅ |
| View reports | ❌ | ✅ |
| Manage users | ❌ | ✅ |

---

## Project Structure

```
PharmaCare/
├── backend/
│   ├── server.js          # Express API — all routes call stored procedures
│   ├── .env               # DB credentials (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Medicines.js
│   │   │   ├── Sales.js
│   │   │   ├── Customers.js
│   │   │   ├── Suppliers.js
│   │   │   ├── Restock.js
│   │   │   ├── Transactions.js
│   │   │   └── UsersAdmin.js
│   │   ├── App.js         # Routing + sidebar + role-based nav
│   │   ├── App.css        # Global styles + CSS variables
│   │   ├── AuthPage.js    # Login + Register page
│   │   └── api.js         # Fetch helper with role header
│   └── package.json
│
└── database/
    ├── schema.sql         # CREATE TABLE statements + seed data
    ├── procedures.sql     # All stored procedures
    └── views.sql          # All database views
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- Microsoft SQL Server 2022
- SSMS (SQL Server Management Studio)

### 1. Database Setup

Open SSMS and run the following files in order:

```sql
-- Step 1: Create database and tables
-- Run: schema.sql

-- Step 2: Create stored procedures, triggers and views
-- Run: procedures.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
DB_SERVER=localhost
DB_NAME=PharmacyInventoryDB
DB_USER=sa
DB_PASSWORD=your_password_here
PORT=5000
```

Start the backend:

```bash
node server.js
```

You should see:
```
✅ Connected to SQL Server!
🚀 Server running on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`

### 4. Default Login

```
Email:    admin@pharmacare.com
Password: admin123
Role:     Admin
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/register` | Public | Register new user |
| GET | `/api/auth/users` | Admin | Get all users |

### Medicines
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/medicines` | All | Get all medicines |
| GET | `/api/medicines/low-stock` | All | Get low stock medicines |
| GET | `/api/medicines/:id` | All | Get single medicine |
| POST | `/api/medicines` | Admin | Add medicine |
| PUT | `/api/medicines/:id` | Admin | Update medicine |
| DELETE | `/api/medicines/:id` | Admin | Delete medicine |

### Sales
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/sales` | All | Get all sales |
| POST | `/api/sales` | All | Record single sale |
| POST | `/api/sales/bulk` | All | Record multi-medicine sale |

### Restock
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/restock` | All | Get all restock orders |
| POST | `/api/restock` | All | Create restock order |
| PUT | `/api/restock/:id/approve` | Admin | Approve restock + update stock |
| PUT | `/api/restock/:id/cancel` | Admin | Cancel restock order |

### Other
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | All | Dashboard summary stats |
| GET | `/api/categories` | All | All categories |
| GET | `/api/suppliers` | All | All suppliers |
| POST | `/api/suppliers` | Admin | Add supplier |
| GET | `/api/customers` | All | All customers |
| POST | `/api/customers` | All | Add customer |
| GET | `/api/transactions` | Admin | Transaction log |
| GET | `/api/reports/revenue` | Admin | Revenue by medicine |
| GET | `/api/reports/expired` | Admin | Expired medicines |

---

## Key Design Decisions

**Stored Procedures over raw queries** — All insert, update, and delete operations go through stored procedures. This centralizes business logic in the database, improves security, and makes validation consistent regardless of how the API is called.

**Transactions for multi-step operations** — Recording a sale deducts stock in the same transaction. Approving a restock updates both the restock status and the medicine stock level atomically. If either step fails, both are rolled back.

**Views for complex queries** — All JOIN-heavy SELECT queries are abstracted into views. This keeps the API routes clean and lets the database handle query optimization.

**Triggers for audit logging** — Every sale and restock approval is automatically logged to the Transactions table by database triggers, requiring no extra API calls.

---

*Built as a Database Systems project — PharmaCare, 2026*