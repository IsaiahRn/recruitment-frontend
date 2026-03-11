# Overview

This frontend is the user-facing application for the recruitment platform.

It supports three user roles:

- Applicant
- HR
- Super Admin

It is built with Next.js and TypeScript, using Zustand for client-side auth/session state and Tailwind CSS for styling.

The UI follows these flows:

- login
- applicant verification and submission
- HR dashboard and applicant review
- admin dashboard, user management, and audit logs

---

## Features and User Flows

### 1. Login

All users sign in with:

- username
- password

After login:

- Applicants go to `/applicant`
- HR goes to `/hr`
- Super Admin goes to `/admin`

### 2. Applicant Flow

Applicants can:

1. Register an account
2. Log in
3. Enter National ID
4. Click **Verify ID**
5. Click **Verify Academic Records**
6. See profile fields auto-populated from simulated services
7. Upload a CV
8. Submit the application
9. View application status and progress history

Current UX behavior:

- only National ID is editable in the applicant workflow
- profile fields are disabled and populated from NID/NESA simulation
- the page is split into:
  - Verification & submission
  - Profile & status

### 3. HR Flow

HR can:

1. View dashboard/statistics
2. View applicants table
3. Select an application
4. Review applicant details
5. Approve or reject applications
6. If application is already approved, only application details remain visible

The HR UI is split into:

- Dashboard
- Applicants & review

### 4. Super Admin Flow

Super Admin can:

1. View dashboard/statistics
2. Create users
3. Edit users
4. Enable/disable users
5. View audit logs

The admin UI is split into:

- Dashboard
- User management
- Audit logs

---

## Architecture

### Frontend Structure

Typical structure:

- `app/`
  - route pages
- `components/`
  - shared UI components
- `lib/`
  - API client, formatting utilities, types
- `store/`
  - Zustand auth store

### Key Design Choices

- Next.js App Router
- role-aware protected pages
- persisted auth state with Zustand
- axios-based API client
- frontend session hydration handling to avoid forced logout on refresh
- reusable UI building blocks (password field, top nav, dashboard cards)

### UI Principles

- wider layout to avoid squeezed content
- split dashboards/workspaces into clearer sections
- consistent auth page styling
- disabled auto-filled fields where data comes from simulation
- green action buttons for applicant verification steps

---

## Tools Used and Why

### Core Stack

- **Next.js**
  - Main frontend framework
  - Handles routing, app structure, rendering

- **TypeScript**
  - Used for types, DTO shapes, safer UI code

- **React**
  - Component-based UI

### State Management

- **Zustand**
  - Used for auth/session state
  - Stores access token, refresh token, and current user
  - Persists state between reloads

### Styling

- **Tailwind CSS**
  - Used for UI styling and layout
  - Fast utility-first styling
  - Makes consistent admin/applicant/HR layouts easier

### Networking

- **Axios**
  - Used for API requests
  - Includes request/response interceptors
  - Handles access token and refresh flow

---

## Local Run Guide

## Prerequisites

Install:

- Node.js 20+
- npm

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

If your backend is exposed on another port, update the value.

---

## 3. Run the frontend

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 4. Build for production test

```bash
npm run build
npm run start
```

---

## Local Notes

### Persisted Login State

The app uses Zustand persistence.
If you want to clear session locally:

```js
localStorage.removeItem("recruitment-auth");
sessionStorage.clear();
```

### Auth Redirect Behavior

Protected pages wait for persisted auth hydration before redirecting, so page reload should not immediately throw the user back to login if the saved session is valid.

### Backend Dependency

Most frontend pages require the backend to be running.
If backend APIs are unavailable, pages may show errors or empty states.

---

## Demo Accounts

### Super Admin

- Username: `admin`
- Password: `Password@123`

### HR

- Username: `hr01`
- Password: `Password@123`

### Applicant

- Username: `applicant01`
- Password: `Password@123`

---

## Current Frontend Highlights

### Applicant

- only National ID is editable
- Verify ID button
- Verify Academic Records button
- disabled auto-populated profile fields
- CV upload and submit flow
- progress timeline/status view

### HR

- dashboard tab
- applicants and review tab
- application details
- approval / rejection workflow
- no actions shown after approval

### Admin

- dashboard tab
- user management tab
- audit logs tab
- create/edit/enable/disable users
- inline validation messages
- password show/hide support
