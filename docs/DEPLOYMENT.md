# Deployment Architecture Diagram

- Single host setup or cloud provider with isolated network.
- **Docker Containers**:
  - `frontend`: Serves built Vite static assets.
  - `backend`: Express application.
  - `db`: PostgreSQL instance.
- Configured using environment-configured variables (`.env`).
