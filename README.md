# Frontend

This folder contains the Next.js applicant / HR / admin web application.

## Stack
- **Next.js 14 + TypeScript**
- **Zustand** for auth session state
- **Tailwind CSS** for UI styling
- **Axios** for API calls
- **Recharts** for dashboard charts

## Features in this folder
- direct username/password login
- applicant self registration
- applicant profile fetch from simulated NID/NESA APIs
- CV upload and application submission
- HR dashboard and review workspace
- Super Admin dashboard and user management screens

## Setup

### Prerequisites
- Node.js 20+
- npm

### Start frontend
```bash
cp .env.local.example .env.local
npm install
npm run dev
```

The app runs at:
- `http://localhost:3000`

## Required environment
`NEXT_PUBLIC_API_BASE_URL` should point to the local gateway:
- `http://localhost:8080/api`

## Workflow
1. Start the backend from `../backend`
2. Start this frontend
3. Open `http://localhost:3000`
4. Log in with seeded users or register a new applicant
