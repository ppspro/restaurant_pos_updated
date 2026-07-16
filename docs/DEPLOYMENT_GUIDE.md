# Deployment Guide

The recommended deployment method for `restaurant_Pos` is using **Docker** and **Docker Compose**.

## Requirements
- Docker Engine
- Docker Compose

## Production Deployment Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rahulsamal12/restaurant_Pos.git
   cd restaurant_Pos
   ```

2. **Configure Environment Variables:**
   Update the `.env` files with secure production values (e.g., strong DB password, long randomized JWT secret).

3. **Build and Run Containers:**
   ```bash
   docker-compose up -d --build
   ```

4. **Initialize Database:**
   Wait for the DB container to be ready, then run the Prisma migrations and seed inside the backend container.
   ```bash
   docker exec -it pos_backend npx prisma db push
   docker exec -it pos_backend npx ts-node prisma/seed.ts
   ```

## Managing Services
- Check logs: `docker-compose logs -f`
- Stop services: `docker-compose down`
- Restart backend: `docker-compose restart backend`
