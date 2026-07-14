# Module 14: System Administration - Enterprise Design Document

## 1. Module Overview
The System Administration module is the control plane for the entire Restaurant POS. It consolidates User Management, Role & Permission matrices, Terminal and Printer registration, System Configuration, Audit Log inspection, Backup orchestration, License validation, and live System Health monitoring into a single, secured SUPER_ADMIN-only console.

## 2. Business Objectives
- **Centralized Control**: A single dashboard for the restaurant owner/IT admin to oversee all system parameters without navigating across modules.
- **Security Governance**: Manage every user's access level, enforce password policies, and terminate rogue sessions from a single panel.
- **Reliability**: Schedule automated backups, monitor system health proactively, and react to failures before they impact the business.
- **Traceability**: Deep audit log inspection for every billing, inventory, and user management event in the system.

## 3. Functional Requirements

### 3.1 User Management
- Full CRUD for staff accounts. Create, Edit, Deactivate, Lock/Unlock.
- Force-logout any active session by revoking their JWT Refresh Token from the database.
- Assign/change a user's role.
- Reset password (generates a temporary password sent via future email channel).

### 3.2 Role & Permission Management
- Visualize and modify permissions via a structured Permission Matrix (rows = Roles, columns = Features/Modules).
- Create new roles for future expansions (e.g., `MANAGER`, `KITCHEN_STAFF`).
- Validate that at least one `SUPER_ADMIN` always exists (prevent accidental lockout).

### 3.3 Terminal & Printer Management
- Register/rename POS Terminals and track their `ONLINE`/`OFFLINE` status via heartbeat events.
- Map receipt and kitchen printers to specific terminals.
- Trigger a test print from the admin UI to verify connectivity.

### 3.4 System Configuration
- Manage core settings: Restaurant Name, GST Number, Timezone, Currency, Session Timeout, and Password Policy.
- Toggle **Maintenance Mode**, which returns a `503` response from all non-admin API endpoints.

### 3.5 Audit & Activity Logs
- A searchable, filterable, paginated table of all `AuditLog` records.
- Filters by User, Action Type, Date Range, and Entity.
- Export to CSV for compliance reporting.

### 3.6 Backup & Restore
- Trigger a manual `pg_dump` database backup from the UI.
- View backup history with file size and timestamp.
- Define retention policies (e.g., auto-delete backups older than 30 days).
- Download a backup file directly from the admin UI.

### 3.7 License Management
- Store and validate a License Key against a local or remote verification service.
- Display expiry date, licensed features, and active terminal count.
- Surface renewal reminders when within 30 days of expiry.

### 3.8 System Health Monitoring
- Expose system-level metrics: CPU %, Memory %, Disk %, Database connection pool status.
- Use Node.js `os` module for CPU/Memory. Use a `pg` pool health check for Database.
- Poll every 10 seconds for near-real-time indicators.

## 4. Non-Functional Requirements
- **Access Control**: Absolutely every route under `/api/admin/*` is gated by `authorize('SUPER_ADMIN')`.
- **Audit Logging**: All mutations performed inside this module (user creation, role changes, settings updates) generate corresponding `AuditLog` entries.
- **Performance**: Admin Dashboard under 500ms, User Search under 100ms, Audit Search under 300ms.

## 5. Database Design (Prisma)
All existing models are leveraged. No new persistent models are strictly required for Phase 1.
- **User, Role, Permission, RolePermission**: Already exists. The admin module provides the UI layer.
- **AuditLog**: Already exists. The admin module provides the searchable viewer.
- **RestaurantSettings**: Already exists. The admin module provides the edit form.
- *(Optional)* `SystemBackup`: A new lightweight model to store metadata about backup runs (filename, timestamp, size, status).
- *(Optional)* `LicenseKey`: A new model to persist the activated license key details.

## 6. API Specification
- `GET/POST/PATCH/DELETE /api/admin/users`
- `GET/POST/PATCH/DELETE /api/admin/roles`
- `GET/POST /api/admin/permissions`
- `GET /api/admin/audit-logs` (paginated, filterable)
- `POST /api/admin/backup` (trigger backup)
- `GET /api/admin/backup/history`
- `GET/PUT /api/admin/settings`
- `GET /api/admin/health` (system metrics)
- `GET/PUT /api/admin/license`

## 7. UI Wireframes & Architecture
- **AdminLayout**: A dedicated full-screen layout with a sidebar linking to all 12 submodules.
- **AdminDashboard (14.1)**: KPI cards (Total Users, Terminals Online, Last Backup, License Status) and a recent audit log mini-table.
- **Permission Matrix (14.3)**: A responsive HTML table with checkboxes. Rows = Roles, Columns = Permissions. Changes are batched and submitted in a single PUT request.
- **SystemHealth (14.10)**: Auto-refreshing gauge cards for CPU, Memory, and Disk with a live line chart for memory trend.

## 8. Security & Testing Strategy
- **Security**: `authorize('SUPER_ADMIN')` middleware applied at the router level. No individual endpoint verification needed.
- **Testing**: 
  - Unit test that verifying `Role Deletion` fails gracefully when users are still assigned to that role.
  - Integration test for Backup trigger to validate file is created on disk.
  - Integration test for Force Logout to confirm the user's refresh token is revoked in the database.
