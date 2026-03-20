# EventX - Online Event Management System

![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-orange)
![Express](https://img.shields.io/badge/Express-5-black)
![Netlify](https://img.shields.io/badge/Frontend-Netlify-green)
![Render](https://img.shields.io/badge/Backend-Render-blueviolet)

A production-ready event booking platform with dedicated **user** and **admin** experiences, real-time updates, secure booking flow, and a fully responsive UI with a separate mobile app-style layout.

## Latest Updates (March 2026)

- Separate mobile app-style shell for small screens
- Improved Gate Scan Console UI for desktop readability
- Refined Explore card/button behavior and clean VIP visibility
- Updated deployment and documentation to latest Netlify + Render setup
- Full README refresh with updated links, structure, and usage instructions

## Live Demo

Frontend: https://online-eventx-management-system.netlify.app/

## What Is Included

- Event discovery and booking with seat selection
- Admin event management (create/edit/delete/cancel/refund)
- Gate Scan Console with check-in validation and status feedback
- Promo code management and validation
- Refund workflow (full and partial cancellation)
- Per-event CGST/SGST support
- Admin-defined VIP seats and VIP pricing model
- User dashboard with booking history, invoices, and profile management
- Real-time client refresh through SSE updates
- Separate mobile shell (`MobileLayout`) for <= 768px viewports

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- Framer Motion
- Lucide React
- Recharts
- XLSX
- jsPDF

### Backend

- Node.js
- Express 5
- JSON file persistence (`backend/data/db.json`)
- Server-Sent Events (SSE) for real-time updates

### Deployment

- Frontend: Netlify
- Backend: Render

## UI/UX (Latest)

- Modern orange-first visual theme
- Card-based layout system
- Responsive typography and spacing
- Table behavior optimized for desktop and mobile
- Dedicated mobile navigation shell:
  - Sticky top bar
  - Drawer menu
  - Bottom navigation
- Touch-friendly controls (44px minimum interactive height)

## Screenshots

### 1) Home / Explore

![Explore Events](screenshots/home.png)

### 2) Admin Dashboard Overview

![Admin Dashboard](screenshots/admin-dashboard.png)

### 3) User Dashboard

![User Dashboard](screenshots/user-dashboard.png)

### 4) Hero Preview

![Hero](src/assets/hero.png)

### 5) Explore Cards (Responsive)

![Explore Cards Responsive](screenshots/home.png)

### 6) Admin Event Controls

![Admin Event Controls](screenshots/admin-dashboard.png)

### 7) Booking History and Profile

![Booking History and Profile](screenshots/user-dashboard.png)

## Project Structure

```text
online-event-management-system/
├── backend/
│   ├── data/
│   │   └── db.json
│   └── server.js
├── public/
├── screenshots/
├── src/
│   ├── components/
│   │   └── MobileLayout.jsx
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── netlify.toml
├── render.yaml
├── package.json
└── README.md
```

## Local Development

### 1) Clone

```bash
git clone https://github.com/parthikrishh/online-event-management-system.git
cd online-event-management-system
```

### 2) Install

```bash
npm install
```

### 3) Run (frontend + backend together)

```bash
npm run dev:full
```

### 4) Frontend only

```bash
npm run dev
```

### 5) Backend only

```bash
npm run server
```

### 6) Lint and build

```bash
npm run lint
npm run build
```

## Environment Variables

### Frontend (Netlify)

```bash
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

### Backend (Render optional)

```bash
PORT=4000
FRONTEND_URL=https://online-eventx-management-system.netlify.app
```

## Deployment Guide

### Backend to Render

This repo already includes `render.yaml`.

1. Create new Render Web Service from this repo
2. Render detects `render.yaml`
3. Deploy and copy backend URL
4. Verify health endpoint:

```text
https://your-backend-domain/api/health
```

### Frontend to Netlify

This repo already includes `netlify.toml`.

1. Import this repo in Netlify
2. Ensure settings:
- Build command: `npm run build`
- Publish directory: `dist`
3. Add env var `VITE_API_BASE_URL`
4. Trigger deploy

## Key APIs

- `GET /api/health` - backend health
- `GET /api/stream` - SSE stream for real-time updates
- `GET /api/events` - list events
- `GET /api/users` - list users
- Booking, refunds, promos, logs endpoints handled under `/api/*`

## Notes

- The backend uses JSON persistence for easy setup and demo use.
- For high-scale production, replace JSON file storage with a managed database.

## Author

Parthiban K B

- GitHub: https://github.com/parthikrishh
- LinkedIn: https://www.linkedin.com/in/parthikrishh

---

If you find this useful, star the repository.
