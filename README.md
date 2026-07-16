<div align="center">
  <img src="https://via.placeholder.com/1000x300?text=Restaurant+POS" alt="Project Banner" />
  <h1>Restaurant POS</h1>
  <p>Enterprise Restaurant POS System built with modern web technologies</p>
  
  <p>
    <a href="https://github.com/rahulsamal12/restaurant_Pos/issues"><img src="https://img.shields.io/github/issues/rahulsamal12/restaurant_Pos" alt="Issues" /></a>
    <a href="https://github.com/rahulsamal12/restaurant_Pos/network/members"><img src="https://img.shields.io/github/forks/rahulsamal12/restaurant_Pos" alt="Forks" /></a>
    <a href="https://github.com/rahulsamal12/restaurant_Pos/stargazers"><img src="https://img.shields.io/github/stars/rahulsamal12/restaurant_Pos" alt="Stars" /></a>
    <a href="https://github.com/rahulsamal12/restaurant_Pos/blob/main/LICENSE"><img src="https://img.shields.io/github/license/rahulsamal12/restaurant_Pos" alt="License" /></a>
  </p>
</div>

---

## 📖 Project Description

**restaurant_Pos** is an Enterprise Restaurant POS System designed to streamline operations for food and beverage establishments. Built using a modern technology stack, it provides robust capabilities for Point of Sale billing, Kitchen Order Tickets (KOT), inventory and customer management, and comprehensive business analytics. With a highly responsive and premium dashboard, it empowers restaurant staff and management to operate efficiently.

---

## ✨ Features

- **Authentication & Authorization**: Secure login with role-based access control.
- **User & Role Management**: Manage staff, assign roles (Super Admin, Cashier, etc.).
- **Menu & Category Management**: Create and manage food categories and items.
- **POS Billing**: Fast and intuitive billing interface for checkouts.
- **Kitchen Order Tickets (KOT)**: Send orders directly to kitchen and track preparation.
- **Dashboard & Analytics**: Real-time sales data, ticket trends, and operational insights.
- **Order & Inventory Management**: Track stock and oversee ongoing orders.
- **Customer Management (CRM)**: Manage customer details and relationships.
- **Loyalty System**: Reward customers for their business.
- **Printer & Terminal Management**: Configure ESC/POS printers and multiple POS terminals.
- **Shift & Business Day Management**: Track cashier shifts, opening balances, and business days.
- **Audit Logs**: Maintain a secure trail of system events.
- **UI/UX**: Premium Dark and Light theme with a fully responsive interface.

---

## 📸 Screenshots

*(Add screenshots of your application in the `screenshots` folder and link them here)*

| Dashboard | POS Checkout |
| :---: | :---: |
| <img src="screenshots/dashboard.png" width="400" alt="Dashboard" /> | <img src="screenshots/pos.png" width="400" alt="POS" /> |

| Kitchen Display | Staff Management |
| :---: | :---: |
| <img src="screenshots/kitchen.png" width="400" alt="KDS" /> | <img src="screenshots/staff.png" width="400" alt="Staff" /> |

---

## 🏗️ Architecture Diagram

Please refer to [`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) for a detailed system diagram and architectural overview.

---

## 📁 Folder Structure

```
restaurant_Pos/
├── backend/                # Node.js, Express, Prisma Backend
│   ├── prisma/             # Prisma Schema & Seeds
│   ├── src/                # Backend Source Code (Controllers, Routes, Services)
│   └── .env.example        # Environment variable template
├── frontend/               # React, Vite, Tailwind CSS Frontend
│   ├── src/                # Frontend Source Code (Components, Pages, Stores)
│   └── .env.example        # Environment variable template
├── docs/                   # Documentation Files
├── screenshots/            # UI Screenshots
├── docker/                 # Dockerfile and configurations
└── .github/                # GitHub Actions and Issue Templates
```

---

## 💻 Technology Stack

**Frontend**:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Query
- Zustand
- Recharts

**Backend**:
- Node.js
- Express
- TypeScript
- Prisma ORM

**Database**:
- PostgreSQL

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+) or Docker

### 1. Clone the repository
```bash
git clone https://github.com/rahulsamal12/restaurant_Pos.git
cd restaurant_Pos
```

### 2. Environment Variables
Copy the `.env.example` to `.env` in the root, backend, and frontend directories and update the variables accordingly.

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Docker Setup (Optional but Recommended)
Start the PostgreSQL database and pgAdmin using Docker Compose:
```bash
docker-compose up -d db pgadmin
```

---

## 🗄️ Database Setup (Prisma)

Navigate to the backend directory, install dependencies, and run migrations:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### Seed Database
Seed the database with default roles, permissions, categories, menu items, and terminals:
```bash
npx ts-node prisma/seed.ts
```

---

## 🏃‍♂️ Run the Application

### Run Backend
```bash
# In the backend directory
npm run dev
```

### Run Frontend
```bash
# In a new terminal, navigate to the frontend directory
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Login Credentials

After seeding the database, you can use the following default credentials to log in:

**Super Admin**:
- **Username**: `admin`
- **Password**: `Admin@123`

**Cashier**:
- **Username**: `cashier`
- **Password**: `Cashier@123`

---

## 📦 Module-wise Features

Detailed module status can be found in [`docs/MODULE_STATUS.md`](docs/MODULE_STATUS.md).
- **Auth Module**: JWT-based authentication, RBAC.
- **Order Module**: Multi-status tracking (Pending, Cooking, Served, Paid).
- **Staff Module**: Payroll tracking, shift assignment.
- **Reporting Module**: X-Reads, Z-Reads, Daily Revenue.

---

## 📡 API Overview

A comprehensive API documentation is available at [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).
- `POST /api/v1/auth/login` - User Login
- `GET /api/v1/orders` - Fetch all orders
- `POST /api/v1/orders` - Create an order
- `GET /api/v1/menu` - Fetch menu items

---

## 🗺️ Future Roadmap

See our [`ROADMAP.md`](ROADMAP.md) for upcoming features and enhancements.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Rahul Samal**
- GitHub: [rahulsamal12](https://github.com/rahulsamal12)

---
<div align="center">
Made with ❤️ by Rahul Samal
</div>
