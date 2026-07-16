# Business Requirements Document (BRD)
## 1. Executive Summary
The Prepaid Restaurant POS System is designed exclusively for fast-casual, prepaid dining environments. By enforcing a payment-first model, the system optimizes transaction speeds, prevents revenue leakage from unpaid bills, and automates kitchen routing.

## 2. Business Objectives
- Ensure 100% prepaid order enforcement.
- Automate order routing based on item types (Kitchen vs Packed).
- Provide unified analytical reporting of sales, cash registers, and tax breakdowns.

## 3. Core Business Rules
- **Rule 1**: Prepaid only.
- **Rule 2**: Payment before order confirmation.
- **Rule 3**: Daily-resetting tokens (e.g. 001, 002).
- **Rule 4**: Kitchen Order Ticket (KOT) contains only Kitchen items. Packed items are excluded.
- **Rule 5**: If only packed items exist in an order, suppress KOT generation.
- **Rule 6**: Admin-only cancellations.
