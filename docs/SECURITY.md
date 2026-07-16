# Security Policy

## 1. Authentication & Session Management
- Passwords hashed using `bcrypt` (rounds=10).
- Stateless authorization via JWT. Short token lifetime (e.g. 2 hours).

## 2. Network & Input Protections
- Input data sanitized and validated using Zod (Frontend) and Express-Validator (Backend).
- Rate limiting middleware configured on all endpoints.
- Secure HTTP headers utilizing `helmet` middleware.
- Prepared statement parameters via Prisma to prevent SQL injection.
- CORS policies restricting API access to validated origins.
