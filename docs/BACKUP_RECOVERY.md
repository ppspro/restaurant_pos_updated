# Backup & Recovery Strategy

## 1. Daily Backup Plan
- Automated pg_dump cron jobs executed nightly at midnight.
- Retained backups stored in secure, off-site cloud storage.
- **Retention Policy**: Daily backups kept for 30 days, monthly backups kept for 1 year.

## 2. Disaster Recovery Scenarios
- **Power Failure**: POS client caches active cart locally. Incomplete payments fail gracefully without registering tokens.
- **Printer Failure**: Cashier can trigger "Reprint Receipt" once hardware is restored. Reprinting uses the existing token in database.
