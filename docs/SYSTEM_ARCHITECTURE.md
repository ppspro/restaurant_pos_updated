# System Architecture

The `restaurant_Pos` application follows a modern decoupled architecture consisting of a React-based frontend SPA, a Node.js Express API backend, and a PostgreSQL database.

## Architecture Overview

1. **Frontend (Client Tier)**
   - Built with **React 18** and **Vite**.
   - State management via **Zustand** (global state) and **React Query** (server state & caching).
   - Styled using **Tailwind CSS** for responsive design.
   - Communicates with the backend using RESTful APIs over HTTP/HTTPS.

2. **Backend (Application Tier)**
   - Built with **Node.js** and **Express**.
   - Written in **TypeScript** for type safety.
   - Handles business logic, authentication (JWT), and API requests.
   - Interacts with the database using **Prisma ORM**.

3. **Database (Data Tier)**
   - **PostgreSQL** relational database.
   - Stores all application data including users, orders, inventory, and shift logs.

## Deployment Model

The system is containerized using **Docker** and **Docker Compose**, allowing for easy deployment across various environments (local, staging, production).

- **pos_frontend**: Nginx container serving static built files (or Vite dev server in dev mode).
- **pos_backend**: Node.js container exposing REST API.
- **pos_db**: PostgreSQL container with a persistent volume.

## Component Interactions

```
[ Web Browser ]  <---HTTP/REST--->  [ Express Backend ]  <---Prisma--->  [ PostgreSQL DB ]
 (React UI)                           (Node.js/TS)                        (Persistent Data)
```
