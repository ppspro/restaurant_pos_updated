# Developer & Troubleshooting Guide

## 1. Quick Start for Developers

**Prerequisites:**
- Node.js 18+
- PostgreSQL
- Docker (optional, for db)

**Running the Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

**Running the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 2. Production Checklist
Before handing over the POS terminal to a restaurant client, verify the following:
- [ ] **Hardware connected:** ESC/POS Thermal printer is connected and mapped to the OS.
- [ ] **Browser configured:** Chrome/Edge is set to "Kiosk Mode" or fullscreen.
- [ ] **Print Dialog bypassed:** Browser shortcut modified with `--kiosk-printing` to prevent the OS print dialog from showing up (crucial for sub-30 second checkouts).
- [ ] **Network setup:** Static IP assigned to the server if terminals operate on a LAN.
- [ ] **Database Backup:** Cron job configured for nightly Postgres dumps.

## 3. Troubleshooting Guide

| Symptom | Probable Cause | Fix / Investigation |
|---------|---------------|---------------------|
| Order fails with "No Active Business Day" | Manager forgot to open the register. | Go to Admin dashboard and open the day. |
| Cart quantities reset randomly | Zustand store key corruption. | Clear LocalStorage (`localStorage.clear()`) and refresh. |
| UI hangs for 5 seconds on checkout | Network timeout attempting to hit API. | Check LAN connection. Offline queue should catch it, verify IndexedDB. |
| KOT printing packed items | Item catalog misconfigured. | Update the item in the database setting `itemType = 'KITCHEN'`. |
| Jest tests failing with "Cannot read properties of undefined" | `ts-jest` and `typescript` version mismatch. | Ensure `typescript@^5.6` is installed in the backend package.json. |
