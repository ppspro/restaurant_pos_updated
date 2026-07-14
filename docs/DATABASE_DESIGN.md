# Database Design

This project utilizes **PostgreSQL** alongside the **Prisma ORM** for database interaction and schema definition.

## Schema Overview

The database schema is designed to handle users, roles, menu items, orders, financial transactions, and physical devices (printers/terminals).

### Core Entities

- **User**: System users (cashiers, admins).
- **Role & Permission**: Role-Based Access Control configuration.
- **Category & MenuItem**: Menu hierarchy and items.
- **Order & OrderItem**: Transaction records and itemized lists.
- **Terminal & Printer**: Physical POS terminals and connected hardware (e.g., KOT printers, receipt printers).
- **CashDrawer & BusinessDay**: Shift management and daily reconciliation.

## Prisma Setup

The schema is defined in `backend/prisma/schema.prisma`.

### Commands
- Update database schema: `npx prisma db push` or `npx prisma migrate dev`
- Generate Prisma client: `npx prisma generate`
- View data in studio: `npx prisma studio`
