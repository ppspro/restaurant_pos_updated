# Testing Strategy

## 1. Test Levels
- **Unit Testing**: Jest/Vitest for math algorithms (VAT/GST calculations, token resetting logic).
- **Integration Testing**: Supertest API endpoints (Auth, Catalog lists, Order checkouts).
- **Printer Verification**: Hardware mocks to validate generated ESC/POS buffer layouts.
- **UAT & Load Testing**: Simulation of 50 simultaneous cashiers checking out.
