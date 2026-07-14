# System Maintenance Manual

## 1. Routine Tasks
- Clean logs older than 90 days.
- Re-index database tables monthly.
- Clean thermal printer rollers weekly.

## 2. Versioning & Migrations
- Schema upgrades must follow Prisma migration flows.
- Always execute a rollback test in staging prior to production deployment.
