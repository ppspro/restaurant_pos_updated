# Module 7: Analytics Developer Guide

This guide provides technical directives for extending the Dashboard and Business Analytics module.

## 1. Adding a New Filter Attribute
If a new operational requirement demands filtering (e.g., `OrderType` like DINE_IN vs TAKEAWAY):

1. **Backend (`analytics.service.ts`):**
   Update `AnalyticsQueryDto` to accept the new property.
   Inside the core service methods, inject the filter payload:
   ```typescript
   const orderWhere: Prisma.OrderWhereInput = {
      createdAt: dateFilter,
      ...(dto.orderType && { orderType: dto.orderType }), // New Filter
   }
   ```

2. **Frontend Store (`analytics.api.ts`):**
   Extend the `AnalyticsFilters` interface:
   ```typescript
   export interface AnalyticsFilters {
     orderType?: string;
   }
   ```

3. **Frontend UI (`DashboardFilters.tsx`):**
   Render the new filter using a Shadcn `<Select>` component mapping to `updateFilter('orderType', value)`. Because the Zustand store automatically pushes updates into TanStack Query, the entire dashboard will reactively update without any manual wiring.

## 2. Adding a New Chart / Visualization
All charts must utilize `ChartCard` to maintain UI standards (Dark mode, CSV exports, standard headers).

1. Define your React component wrapping a Recharts element (`BarChart`, `LineChart`, etc).
2. Cast `Tooltip` and `Legend` props with `any` to avoid strict TypeScript conflicts in Recharts typings:
   ```tsx
   <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' } as any} />
   ```
3. Wrap it in `ChartCard`:
   ```tsx
   return (
     <ChartCard title="My New Chart" description="Custom insights" onExport={() => exportLogic()}>
       <ResponsiveContainer width="100%" height={300}>
         <LineChart data={data}>...</LineChart>
       </ResponsiveContainer>
     </ChartCard>
   );
   ```

## 3. Optimizing Aggregations
Currently, aggregations occur in-memory after Prisma performs an optimized `findMany` fetching only strictly necessary selected fields.
- **NEVER** use `findMany` without a `select` clause in analytics services; you risk memory bloating the Node server.
- If data volume grows massively (e.g., millions of rows per query interval), migrate from in-memory processing to raw Prisma aggregate queries or SQL views.
