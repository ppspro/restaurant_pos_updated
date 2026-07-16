# Module 13: Notifications & Communication Center - Enterprise Design Document

## 1. Module Overview
The Notifications & Communication module is the central nervous system for all POS alerts. It aggregates, filters, and distributes critical operational alerts (e.g., Low Inventory, KDS Delays, Shift Closures, System Health) to the appropriate roles in real-time. It is built to seamlessly support future outbound channels like SMS, Email, and WhatsApp.

## 2. Business Objectives
- **Centralized Visibility**: Ensure that managers are instantly aware of operational bottlenecks (e.g., delayed kitchen orders, high cash drawer variance).
- **Proactive Management**: Alert staff *before* an issue impacts a customer (e.g., low stock warnings, low printer paper).
- **Targeted Delivery**: Route specific alerts only to the roles that need them (e.g., Cashiers do not need database health alerts; Kitchen Staff do not need shift cash alerts).

## 3. Functional Requirements
- **Notification Inbox**: A central UI dashboard where users can view, filter, and act on historical notifications.
- **Top-nav Bell Icon**: A real-time unread counter that opens a quick-drawer of the most recent alerts.
- **Priority Tiering**: Alerts are tiered (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`). `CRITICAL` alerts override user preferences and cannot be muted.
- **Preferences Panel**: Users can opt in or out of specific non-critical alert categories.
- **Alert Generation Types**:
  - *System*: Server downtime, memory limits.
  - *Inventory*: Expiry warnings, reorder thresholds.
  - *Kitchen*: SLA breaches, new high-priority orders.
  - *Shift/Business*: Missing shift closures, expected cash variances.

## 4. Non-Functional Requirements
- **Performance**: Polling or WebSocket delivery under 500ms. Database reads for unread counts < 100ms.
- **Future Proofing**: The architecture must use an abstract `NotificationChannel` interface to easily plug in Twilio (SMS), SendGrid (Email), or WhatsApp Business APIs in subsequent phases.
- **Auditability**: Acknowledging (marking as read) a notification logs the actor and timestamp.

## 5. User Stories
1. *As a Manager*, I want to receive a notification immediately if a Cashier attempts to close a shift with a cash difference exceeding ₹500.
2. *As a Chef*, I want a visual alert on my screen if a specific order breaches the 15-minute preparation SLA.
3. *As an Admin*, I want to be alerted if the POS loses connection to the receipt printer, so I can fix it before the rush hour.

## 6. Business Rules
- **Role Scoping**: Notifications are scoped either to a specific `userId` or a specific `roleId`. 
- **Persistence**: Unread notifications remain active and negatively impact the UI (e.g., pulsing red bell) until explicitly acknowledged.
- **Critical Exemption**: `CRITICAL` priority notifications ignore user `NotificationPreference` opt-outs.

## 7. Database Design (Prisma)
- **`Notification`**: Stores title, body, priority, type, read status, and relational targets (`userId` or `roleId`).
- **`NotificationPreference`**: User-specific toggles for different notification types (e.g., `inventory_alerts: false`).
- *(Future)* `NotificationChannel` & `NotificationTemplate`.

## 8. API Specification
- `GET /api/notifications` (paginated, filterable)
- `GET /api/notifications/unread-count` (optimized aggregation)
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`
- `GET/PUT /api/notifications/preferences`

## 9. UI Wireframes & Architecture
- **Global Header**: Inject the `NotificationBell` component into the global layout shell. It maintains a React Query polling hook for the unread count.
- **NotificationDrawer**: A slide-out panel showing the top 5 most recent unread alerts, color-coded by priority (Red = Critical, Yellow = High).
- **Notification Center Dashboard**: A full-page view for deep filtering and historical searches.

## 10. Security & Testing Strategy
- **Security**: Strict authorization checks. A user can only fetch notifications explicitly targeted to their `userId` or their assigned `roleId`.
- **Testing**: Test the aggressive polling mechanisms to ensure they don't block the React main thread. Validate that `CRITICAL` alerts bypass preference filters in backend unit tests.
