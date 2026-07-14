# Functional Requirements Specification (FRS)

## 1. Checkout Workflow
- Cashier enters active cart and selects payment mode (Cash, Card, UPI).
- System triggers a database transaction that generates the token, registers payment, and flags the order as PAID.
- Emits print triggers for Customer Receipt, Restaurant Receipt, and KOT.

## 2. Admin Portal
- Cashier account provisioning.
- Real-time catalog editor (marking items as Kitchen vs Packed).
- Sales dashboard reporting gross revenues, tax summaries, and cancellation volume.
