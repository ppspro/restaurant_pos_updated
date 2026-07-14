# API Design Specification

## V1 Base Routes

### Authentication
- `POST /api/v1/auth/login` (Public)

### Cashiers (Admin Only)
- `GET /api/v1/users`
- `POST /api/v1/users`

### Menu & Categories
- `GET /api/v1/menu`
- `POST /api/v1/menu` (Admin Only)
- `GET /api/v1/categories`

### Orders
- `POST /api/v1/orders` (Initiate order)
- `POST /api/v1/orders/:id/pay` (Process payment, token, triggers printing)
- `POST /api/v1/orders/:id/cancel` (Admin Only)
