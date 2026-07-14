# Deployment Checklist

- [ ] Configure `.env` variables (JWT_SECRET, DATABASE_URL, PORT).
- [ ] Run Prisma database migrations to apply latest schema.
- [ ] Seed default database (Super Admin user, settings).
- [ ] Configure Nginx reverse proxy with SSL certificates.
- [ ] Verify rate limiter configuration matches throughput test values.
- [ ] Perform print tests for both 58mm and 80mm printers.
