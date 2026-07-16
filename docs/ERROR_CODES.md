# System Error Codes

| Area | Code | Message | Description |
|------|------|---------|-------------|
| Auth | `AUTH_001` | Invalid Credentials | Username/Password mismatch |
| Auth | `AUTH_002` | Session Expired | JWT token validation failed |
| Auth | `AUTH_003` | Access Denied | Role permissions insufficient |
| Orders | `ORDER_001` | Order Not Found | Requested order UUID does not exist |
| Orders | `ORDER_002` | Already Paid | Cannot process payment on a paid order |
| Orders | `ORDER_003` | Cancel Failed | Cashiers cannot cancel orders |
| Payments | `PAY_001` | Gateway Offline | UPI/Card terminal response timeout |
| Payments | `PAY_002` | Amount Mismatch | Sent amount does not equal cart total |
| Menu | `MENU_001` | Item Disabled | Menu item is flagged out-of-stock |
| Printing | `PRINT_001` | Printer Unreachable | Socket connection to thermal printer failed |
