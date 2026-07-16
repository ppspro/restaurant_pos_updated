# Database Migration Strategy

- **Migration Tool**: Prisma Migrate.
- **Workflow**:
  1. Modify `schema.prisma`.
  2. Run `npx prisma migrate dev --name <description>` locally.
  3. Validate using local unit tests.
  4. Deploy to production via standard CI/CD pipeline running `prisma migrate deploy`.
- **Rollbacks**: Revert schema modifications and generate corrective migrator logs.
