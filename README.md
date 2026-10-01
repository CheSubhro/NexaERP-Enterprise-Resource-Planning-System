# NexaERP

NexaERP is a modern full-stack Enterprise Resource Planning (ERP) system designed to manage business operations through a centralized and secure platform.

## 🚀 Features

* 🔐 Authentication with Laravel Sanctum
* 👥 Role-Based Access Control (RBAC)
* 🔑 Permissions Management
* 📊 Dashboard & Business Overview
* 📦 Product Management
* 🗂️ Category Management
* 👤 Customer Management
* 🏢 Supplier Management
* 💰 Sales Management
* 🛒 Purchase Management
* 💸 Expense Management
* 📈 Reports & Analytics
* 👨‍💼 User Management
* ⚙️ System Settings
* 📉 Stock & Low-Stock Tracking
* 🔒 Protected API Routes
* ✅ Request Validation

## 🛠️ Tech Stack

### Backend

* Laravel 13
* PHP 8.4
* MongoDB
* Laravel Sanctum
* REST API

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Context API

## 📂 Project Structure

```text
nexa-erp/
├── backend/
│   └── Laravel API
│
└── frontend/
    └── React + TypeScript Application
```

## 📋 Main Modules

* Dashboard
* Categories
* Products
* Customers
* Suppliers
* Sales
* Purchases
* Expenses
* Reports
* Users
* Roles & Permissions
* Settings

## 🔐 Security

NexaERP uses Laravel Sanctum for API authentication and a permission-based middleware system for controlling access to different ERP modules and actions.

## ⚙️ Backend Setup

```bash
cd backend
composer install
php artisan serve
```

Configure your MongoDB connection and environment variables in `.env`.

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Configure the backend API URL in the frontend `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 📸 Screenshots

Project screenshots are available in the `screenshot` directory.

## 📌 Project Status

NexaERP is an actively developed ERP application with modular architecture designed to support business management, inventory, sales, purchasing, expenses, reporting, and user access control.

## 👨‍💻 Developer

Developed as a full-stack ERP project using Laravel and React by CheSubhro



![Categories](screenshot/screencapture-localhost-5173-categories-2026-10-01-16_37_17.png)

![Categories](screenshot/screencapture-localhost-5173-categories-2026-10-01-16_37_26.png)

![Categories](screenshot/screencapture-localhost-5173-categories-2026-10-01-16_37_35.png)

![Categories](screenshot/screencapture-localhost-5173-categories-2026-10-01-16_37_43.png)

![Customers](screenshot/screencapture-localhost-5173-customers-2026-10-01-16_37_57.png)

![Customers](screenshot/screencapture-localhost-5173-customers-2026-10-01-16_38_08.png)

![Customers](screenshot/screencapture-localhost-5173-customers-2026-10-01-16_38_21.png)

![Customers](screenshot/screencapture-localhost-5173-customers-2026-10-01-16_38_32.png)

![Dashboard](screenshot/screencapture-localhost-5173-dashboard-2026-10-01-16_35_49.png)

![Dashboard](screenshot/screencapture-localhost-5173-dashboard-2026-10-01-16_44_16.png)

![Expenses](screenshot/screencapture-localhost-5173-expenses-2026-10-01-16_40_41.png)

![Expenses](screenshot/screencapture-localhost-5173-expenses-2026-10-01-16_40_50.png)

![Expenses](screenshot/screencapture-localhost-5173-expenses-2026-10-01-16_41_08.png)

![Login](screenshot/screencapture-localhost-5173-login-2026-10-01-16_35_27.png)

![Products](screenshot/screencapture-localhost-5173-products-2026-10-01-16_36_02.png)

![Products](screenshot/screencapture-localhost-5173-products-2026-10-01-16_36_12.png)

![Products](screenshot/screencapture-localhost-5173-products-2026-10-01-16_36_45.png)

![Products](screenshot/screencapture-localhost-5173-products-2026-10-01-16_36_57.png)

![Products](screenshot/screencapture-localhost-5173-products-2026-10-01-16_37_05.png)

![Purchases](screenshot/screencapture-localhost-5173-purchases-2026-10-01-16_40_20.png)

![Purchases](screenshot/screencapture-localhost-5173-purchases-2026-10-01-16_40_28.png)

![Reports](screenshot/screencapture-localhost-5173-reports-2026-10-01-16_41_18.png)

![Reports](screenshot/screencapture-localhost-5173-reports-2026-10-01-16_41_25.png)

![Reports](screenshot/screencapture-localhost-5173-reports-2026-10-01-16_41_33.png)

![Reports](screenshot/screencapture-localhost-5173-reports-2026-10-01-16_41_42.png)

![Roles](screenshot/screencapture-localhost-5173-roles-2026-10-01-16_42_35.png)

![Roles](screenshot/screencapture-localhost-5173-roles-2026-10-01-16_42_46.png)

![Roles](screenshot/screencapture-localhost-5173-roles-2026-10-01-16_42_56.png)

![Sales](screenshot/screencapture-localhost-5173-sales-2026-10-01-16_39_29.png)

![Sales](screenshot/screencapture-localhost-5173-sales-2026-10-01-16_39_39.png)

![Settings](screenshot/screencapture-localhost-5173-settings-2026-10-01-16_43_16.png)

![Suppliers](screenshot/screencapture-localhost-5173-suppliers-2026-10-01-16_38_43.png)

![Suppliers](screenshot/screencapture-localhost-5173-suppliers-2026-10-01-16_38_50.png)

![Suppliers](screenshot/screencapture-localhost-5173-suppliers-2026-10-01-16_39_04.png)

![Suppliers](screenshot/screencapture-localhost-5173-suppliers-2026-10-01-16_39_13.png)

![Users](screenshot/screencapture-localhost-5173-users-2026-10-01-16_41_56.png)

![Users](screenshot/screencapture-localhost-5173-users-2026-10-01-16_42_02.png)

![Users](screenshot/screencapture-localhost-5173-users-2026-10-01-16_42_12.png)

![Users](screenshot/screencapture-localhost-5173-users-2026-10-01-16_42_22.png)
