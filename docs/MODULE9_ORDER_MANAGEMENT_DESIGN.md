# Module 9: Order Management Design Document

## Objective
Design a comprehensive Order Management system for the Restaurant POS to allow cashiers and administrators to view historical orders, check detailed receipts, reprint tickets, monitor kitchen status, and handle secure order cancellations.

## Features
1. **Order History & Dashboard**: View orders across business days, shifts, or overall history with robust server-side paginated tables.
2. **Order Details**: A slide-out drawer or modal showing the full anatomy of an order (Items, Taxes, Totals, Payments).
3. **Advanced Search & Filters**: Search by Token, Order Number, Cashier, Status, Date.
4. **Reprint Engine**: Reprint customer receipts or kitchen tickets. *Critical Rule: Reprints NEVER generate new tokens or new orders. All reprints are strictly audited.*
5. **Order Cancellation**: Secure cancellation workflow (requires SUPER_ADMIN or specific permissions), requires a reason, updates timeline, and generates an audit log.
6. **Kitchen Timeline**: View the lifecycle of an order from DRAFT -> PREPARING -> READY -> COMPLETED.

## UI/UX Approach
- **OrderDashboard.tsx**: The central hub for order management. Will feature metric cards at the top (Today's Orders, Pending, Cancelled) and a large Data Table below.
- **DataTable**: Re-use the existing TanStack Table implementation for robust server-side pagination and sorting.
- **OrderDetailsDrawer.tsx**: A Shadcn `Sheet` component to slide in from the right when an order is clicked, preventing loss of context.
- **Action Menus**: Use Shadcn `DropdownMenu` inside the table rows for quick actions (View, Reprint, Cancel).

## Backend Architecture
- **OrderController.ts & OrderService.ts**: Will house the complex `findMany` queries with dynamic `where` clauses to handle advanced filtering.
- **Reprint Service**: Dedicated logic to format and push existing orders to the printer queues, injecting a "DUPLICATE / REPRINT" watermark.
- **Cancellation Service**: Transactional logic to update order status, update payment status to REFUNDED, log the cancellation reason, and create an AuditLog entry.

## API Endpoints
- `GET /api/orders/history`: Paginated list of orders with filters.
- `GET /api/orders/:id`: Detailed view of a single order.
- `POST /api/orders/:id/reprint`: Trigger a reprint (body specifies receipt or KOT).
- `POST /api/orders/:id/cancel`: Cancel an order (requires reason).
