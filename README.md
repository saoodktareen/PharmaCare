# PharmaCare — Pharmacy Inventory Management System

A full-stack pharmacy inventory system built with React, Node.js/Express, and Microsoft SQL Server.

## Features
- Role-based access (Admin & Staff)
- Medicine inventory with low stock and expiry alerts
- Sales recording with stock validation
- Restock order management (create, approve, cancel)
- Customer management and purchase history
- Supplier management
- Reports: sales by date range, stock value, customer history
- Transaction logs
- User management (admin only)

---

## Prerequisites
- Node.js installed
- Microsoft SQL Server running locally
- The `PharmacyInventoryDB` database set up with all tables, views, and stored procedures

---

## Environment Setup

Before running the backend, create a `.env` file inside the `backend/` folder with the following:

```
DB_SERVER=localhost
DB_NAME=PharmacyInventoryDB
DB_USER=sa
DB_PASSWORD=your_sql_server_password
PORT=5000
```

Replace `your_sql_server_password` with your actual SQL Server `sa` account password. If you use a different SQL Server login, replace `sa` with that username too.

---

## Setup & Running

### 1. Backend
```bash
cd backend
npm install
node server.js
```
Server runs on **http://localhost:5000**

You should see:
```
✅ Connected to SQL Server!
🚀 Server running on http://localhost:5000
```

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm start
```
App opens on **http://localhost:3000**

---

## Default Admin Login
```
Email:    admin@pharmacare.com
Password: admin123
```

---

## Project Structure
```
PharmaCare/
├── backend/
│   ├── server.js       # Express API + SQL Server connection
│   └── .env            # Database credentials (create this manually)
└── frontend/
    └── src/
        ├── App.js
        ├── AuthPage.js
        └── components/
            ├── Dashboard.js
            ├── Medicines.js
            ├── Sales.js
            ├── Customers.js
            ├── Suppliers.js
            ├── Restock.js
            ├── Transactions.js
            ├── Reports.js
            └── UsersAdmin.js
```