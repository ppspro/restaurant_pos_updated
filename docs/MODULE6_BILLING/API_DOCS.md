# Billing API Documentation

This document describes the REST APIs exposed by the POS Billing System for order processing.

## Base URL
`/api/billing/orders`

---

## 1. Create Order
**POST** `/api/billing/orders`

Creates a prepaid order, increments the daily token counter, and returns token and receipt payload.

### Request Body
```json
{
  "cashierId": "string (UUID)",
  "items": [
    {
      "menuItemId": "string",
      "itemName": "string",
      "quantity": "number",
      "unitPrice": "number",
      "gst": "number",
      "itemType": "KITCHEN | PACKED",
      "notes": "string (optional)"
    }
  ],
  "subtotal": "number",
  "gstAmount": "number",
  "discount": "number",
  "grandTotal": "number",
  "paymentMethod": "CASH | UPI | CARD",
  "receivedCash": "number (optional, required if CASH)",
  "transactionReference": "string (optional, required if UPI/CARD)"
}
```

### Responses
**201 Created**
```json
{
  "success": true,
  "data": {
    "orderId": "string",
    "orderNumber": "ORD-YYYYMMDD-NNN",
    "tokenNumber": 42,
    "businessDate": "DD/MM/YYYY"
  }
}
```

**409 Conflict** - Returned if the POS manager has not opened the current Business Day.
```json
{
  "success": false,
  "message": "Cannot create order: No active business day."
}
```

---

## 2. Get Recent Orders
**GET** `/api/billing/orders/recent?cashierId={id}`

Fetches today's completed orders for the active cashier to display in the Order History panel.

### Parameters
- `cashierId` (query string): The UUID of the current logged-in cashier.

### Responses
**200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-20260710-042",
      "grandTotal": 250,
      "paymentMethod": "CASH",
      "status": "COMPLETED",
      "createdAt": "2026-07-10T10:30:00Z"
    }
  ]
}
```

---

## 3. Cancel Order
**PUT** `/api/billing/orders/:id/cancel`

Soft cancels an order. Requires a cancellation reason and an authorized user ID.

### Request Body
```json
{
  "reason": "Customer changed mind after payment",
  "userId": "string (UUID)"
}
```

### Responses
**200 OK**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```
