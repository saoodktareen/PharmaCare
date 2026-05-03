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

## Setup & Running

### 1. Backend
```bash
cd backend
npm install
node server.js
```
Server runs on **http://localhost:5000**

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
│   └── server.js       # Express API + SQL Server connection
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