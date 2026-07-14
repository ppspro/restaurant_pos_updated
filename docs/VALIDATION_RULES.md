# Validation Rules

## 1. Authentication Schemas (Zod / express-validator)
- `username`: Required, min 3 characters, max 30 characters.
- `password`: Required, min 6 characters.

## 2. Order Checkout Payload Validation
- `order_id`: UUID format validation.
- `payment_method`: ENUM validation (`CASH`, `UPI`, `CARD`).
- `items`: Array, min 1 item.
  - `menu_item_id`: UUID format validation.
  - `quantity`: Int, min 1, max 99.
