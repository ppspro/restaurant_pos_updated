# Business Requirements Document (BRD)

## 1. Project Background
The system is built exclusively for prepaid restaurants where customers pay before consumption. The core business intent is to optimize order turnover and prevent unpaid checkout instances.

## 2. Core Business Rules
- **Rule 1**: Prepaid only. Payment must be processed successfully before any receipt or order ticket is dispatched.
- **Rule 2**: Each order generates exactly one unique Token number.
- **Rule 3**: Tokens reset to `001` daily at midnight.
- **Rule 4**: Kitchen Order Tickets (KOT) must ONLY display `Kitchen` items.
- **Rule 5**: `Packed` items are strictly excluded from the KOT.
- **Rule 6**: If an order contains only Packed items, no KOT is generated.
- **Rule 7**: Order cancellation is restricted to Super Admin role only.
- **Rule 8**: Cancelled orders are preserved in the DB for audit trail reporting.
