# API Documentation

The REST API is built using Node.js and Express. It serves as the primary communication channel for the React frontend.

## Base URL
All API routes are prefixed with `/api/v1`

## Authentication
Most endpoints require a valid JWT passed in the Authorization header:
`Authorization: Bearer <token>`

## Key Endpoints

### Auth
- `POST /auth/login` - Authenticate user and return JWT.
- `POST /auth/refresh` - Refresh an expired access token.

### Orders
- `GET /orders` - List all orders (supports pagination/filtering).
- `POST /orders` - Create a new POS order.
- `PUT /orders/:id/status` - Update order status (e.g., from 'Pending' to 'Served').

### Menu
- `GET /menu` - Fetch all menu items grouped by categories.
- `POST /menu` - Create a new menu item.

### Terminals & Shift
- `POST /shift/open` - Open a new cashier shift.
- `POST /shift/close` - Close shift and reconcile cash drawer.

*For full endpoint parameters and payload schemas, refer to the route handlers in `backend/src/routes/`.*
