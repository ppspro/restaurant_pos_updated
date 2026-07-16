# Module 11: Kitchen Display System (KDS) - Enterprise Design Document

## 1. Module Overview
The Kitchen Display System (KDS) is a critical operational component designed to replace traditional paper tickets with a dynamic, digital screen in the kitchen. It receives orders in real-time as they are paid and explicitly filters for only `KITCHEN` items (ignoring `PACKED` items). The KDS UI is optimized for touch, featuring large status cards, color-coded SLAs (Service Level Agreements), and audio-visual notifications to maximize kitchen throughput.

## 2. Business Objectives
- **Zero Paper Waste**: Fully digitize Kitchen Order Tokens (KOT).
- **Speed & Efficiency**: Provide real-time visibility into the queue, enabling chefs to prioritize delayed or high-priority orders.
- **Accuracy**: Prevent missing or misplaced paper tickets. Only route items requiring preparation to the KDS.
- **Analytics**: Measure actual preparation times against SLAs to identify operational bottlenecks.

## 3. Functional Requirements
- **Live Queue**: Real-time display of orders falling into Waiting, Preparing, and Ready states.
- **Order Cards**: Large, legible cards displaying the Token Number, Order Time, Elapsed Timer, and list of items with quantities and special notes.
- **Status Lifecycle**: Chefs must be able to tap an order to move it from WAITING -> PREPARING -> READY -> COMPLETED.
- **Timer & SLAs**: Each card features a live timer. The timer is color-coded:
  - Green: Within SLA.
  - Yellow: Nearing SLA limit.
  - Red: Delayed/Breached SLA.
- **Notifications**: Audio chimes and visual flashes for new and delayed orders.
- **Analytics**: Compute average preparation times across the shift.

## 4. Non-Functional Requirements
- **UI/UX**: Touch-friendly, dark mode enabled, full-screen capability, high contrast.
- **Performance**: Status updates must persist and broadcast under 200ms.
- **Polling/Real-time**: While WebSockets are ideal, the initial architecture will utilize aggressive React Query background polling (e.g., every 5 seconds) for robustness until a dedicated Socket.io layer is justified.
- **Security**: Specific `KITCHEN` role or `SUPER_ADMIN` required. Cashiers do not manage KDS status.

## 5. Order Flow & Business Rules
1. Customer pays at POS.
2. POS fires POST `/api/orders`. 
3. Backend creates Order. If any `OrderItem.itemType === 'KITCHEN'`, the order is visible on the KDS.
4. KDS polls and displays the new order as `WAITING`.
5. Chef taps order -> Status changes to `PREPARING`.
6. Chef finishes -> Status changes to `READY`. (This state can notify the expeditor or cashier).
7. Order is served -> Status changes to `COMPLETED` and is archived from the active KDS view.

## 6. Database Review & Improvements
The existing Prisma `Order` model already contains the `orderStatus` enum (`DRAFT`, `PAID`, `PRINTED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`). 
**Improvement**: We must ensure that we track *when* the order enters the KDS, and *when* it is marked completed to accurately calculate the prep time. We can utilize `createdAt` vs `completedAt`, but adding a `preparedAt` timestamp in the future would separate prep time from delivery time. For Phase 1, `completedAt` acts as the KDS exit timestamp.

## 7. API Specification
- `GET /api/kitchen/queue`: Fetches active orders (WAITING, PREPARING, READY) containing kitchen items.
- `PATCH /api/kitchen/orders/:id/status`: Updates the `orderStatus` (e.g., to PREPARING) and stamps an AuditLog.
- `GET /api/kitchen/analytics`: Computes avg prep time and volume metrics for the current business day.

## 8. UI Wireframes & Architecture
- **KitchenLayout**: A minimalist header showing the current time, connection status, and basic filters.
- **Kanban Board / Grid**: A CSS Grid layout. Orders can be grouped by status (Waiting column, Preparing column) or just sorted by time across a single massive grid depending on the screen size.
- **OrderCard Component**: 
  - Header: Token # (Massive Font), Elapsed Time (Dynamic color).
  - Body: List of `OrderItem` where `type === KITCHEN`.
  - Footer: Large touch target to advance status.
