# Module 7: Dashboard & Business Analytics Architecture

## Overview

The Analytics module converts raw transactional data from Prisma into a highly visual, actionable Business Intelligence (BI) dashboard. It operates as a read-only layer ensuring no performance impact on core operational modules like Orders or Payments.

## Stack
- **Backend:** Express, Prisma
- **State Management:** Zustand (`useDashboardStore`)
- **Data Reactivity:** TanStack Query (`useAnalytics`, `AnalyticsApi`)
- **Visualizations:** Recharts (`ChartCard` wrapper)
- **Styling:** Tailwind CSS, Shadcn UI

---

## 1. Backend Architecture

The core philosophy of the backend is **Memory Delegation**. Instead of executing highly complex `GROUP BY` SQL statements that risk locking the database, the `AnalyticsService` relies on efficient batch `findMany` queries mapped through memory aggregation.

### Key Workflows:
1. **Query Parsing:** The `AnalyticsController` parses incoming requests and constructs an `AnalyticsQueryDto`.
2. **Date Boundaries:** `analytics.service.ts` uses `getDateFilter(dto)` to standardize `startDate` and `endDate` boundaries (using `date-fns`).
3. **Filtering:** Global filters (`cashierId`, `terminalId`, `categoryId`, `paymentMethod`) are conditionally appended to Prisma's `where` input payload.
4. **Aggregation:** Aggregations (e.g., peak hours, revenue trends) iterate over the batch dataset in-memory to prevent database deadlock.

### RBAC Constraints
- `SUPER_ADMIN` / `ADMIN`: Unrestricted access across all dates and staff.
- `CASHIER`: Handled at the Controller layer. The controller forcefully overrides the `cashierId` payload matching the `req.user.id`, ensuring a Cashier can strictly see only their personal KPI metrics.

---

## 2. Frontend Architecture

### Global State (`useDashboardStore`)
The frontend is driven by a centralized Zustand store (`src/store/useDashboardStore.ts`). It manages the `AnalyticsFilters` matrix. Updating a filter in `DashboardFilters.tsx` syncs universally, forcing a re-render of all visualizations inside `AdminDashboard.tsx`.

### API & TanStack Query Layer
The frontend decouples UI components from raw HTTP requests:
1. **`analytics.api.ts`:** Handles raw Axios connections to the backend.
2. **`useAnalytics.ts`:** Wraps the API in React Query, defining strict enterprise cache patterns:
   - `staleTime: 5 mins` (Reduces needless network spam while tab-switching).
   - `gcTime: 10 mins`.
   - `retry: 2` (Exponential backoff resilience).

### Visualization Standards (`ChartCard`)
To enforce uniform UI/UX, we created a universal `ChartCard.tsx` wrapper. 
- All visualizations strictly adhere to dark mode styling dynamically.
- `ChartCard` ships with a built-in `onExport` function to download CSV data instantly based on the rendered view.
