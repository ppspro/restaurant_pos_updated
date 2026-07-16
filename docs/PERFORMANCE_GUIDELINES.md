# Performance & Optimization Guidelines

## 1. Frontend Optimization
- Code splitting and lazy loading of route views.
- Component assets pre-rendered or statically loaded.
- Optimistic UI updates during checkout.

## 2. Backend & DB Optimization
- Connection pooling configured in Prisma.
- Indexes on frequently searched fields: `Orders.token_number`, `Orders.created_at`, `MenuItems.category_id`.
- Pagination on all report endpoints.
