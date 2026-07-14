# Software Design Document (SDD)

## 1. Architecture Patterns
- **Clean Architecture**: Domain model layer isolates logic from data stores and UI.
- **Micro-Services Ready**: Domain functions are grouped into clean, feature-complete modules (Auth, Billing, printing, settings).
- **Security Middlewares**: Enforces rate limiting, helmet security headers, and JWT tokens.
