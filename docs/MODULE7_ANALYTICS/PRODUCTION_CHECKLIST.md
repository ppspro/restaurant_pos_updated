# Module 7: Production Readiness Checklist

Before deploying the Analytics Module to a high-volume production environment, ensure the following database and caching criteria are fulfilled:

## Database Indexing (Critical)
Because Analytics queries scan wide date ranges across large datasets, the following Prisma database indexes **MUST** be verified in your schema and physically applied in PostgreSQL:
- [ ] `@@index([createdAt])` on `Order` table.
- [ ] `@@index([orderStatus])` on `Order` table (often queried with `createdAt`).
- [ ] `@@index([cashierId, createdAt])` for fast Cashier performance retrieval.
- [ ] `@@index([createdAt])` on `Payment` table for payment analytics.

## Backend Infrastructure
- [ ] **Node.js Memory:** Ensure the production environment gives the Node process adequate heap memory (`--max-old-space-size`), as aggregations heavily map arrays in memory.
- [ ] **Timezone Configuration:** Ensure the production database server and Node.js server share the same exact UTC configurations. Misaligned timezones will break `date-fns` analytics boundary logic.

## Frontend Infrastructure
- [ ] **React Query Reactivity:** Ensure `staleTime` and `gcTime` are correctly parameterized so you do not accidentally DDOS the backend with rapid React re-renders.
- [ ] **Data Export Limits:** Ensure CSV export functionalities correctly escape characters to prevent CSV injection vulnerabilities if rendering raw user input from order notes.
