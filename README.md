# HomeFix

HomeFix is a three-tier home-service booking platform with a React/Vite frontend, an Express REST API, and PostgreSQL data storage.

## Project layout

```text
frontend/   React + Vite application
backend/    Express API with JWT authentication and PostgreSQL access
database/   PostgreSQL migration and fictional seed data
```

## Requirements

- Node.js 20+
- PostgreSQL 15+

## Install

From the repository root:

```bash
npm run install:all
```

## Database setup

Create the database and apply the migration and seed scripts in order:

```bash
createdb homefix
psql homefix -f database/001_schema.sql
psql homefix -f database/002_seed.sql
```

The migration creates `users`, `services`, `professionals`, `bookings`, and `reviews`, plus the `service_professionals` join table for the service/professional many-to-many relationship. The migration is re-runnable and recreates HomeFix tables, so do not run it against a database containing data you need to keep.

Seed totals:

- 10 services
- 15 professionals
- 10 users
- 20 bookings
- 25 reviews

All seed names, emails, phone numbers, addresses, and profile image URLs are fictional. Passwords are stored as `pgcrypto` hashes. Demo passwords follow `HomeFixDemo!N`, where `N` is the user number.

## Run the application

Open two terminals from the repository root.

Terminal 1, frontend:

```bash
npm run dev
```

Terminal 2, backend:

```bash
npm run backend
```

The frontend runs on the first available Vite port, usually `http://localhost:5173`. The API runs at `http://localhost:5001`. Port `5000` is avoided because macOS AirTunes commonly uses it.

You can also run each package directly:

```bash
cd frontend && npm run dev
cd backend && npm run dev
```

Do not run `npm run backend` from inside `backend`; that script belongs to the repository root. Inside `backend`, use `npm run dev`.

## API configuration

The backend defaults to:

```text
DATABASE_URL=postgresql://localhost:5432/homefix
PORT=5001
JWT_SECRET=homefix-development-secret
```

For a non-default database or production-like local setup, define these variables in `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/homefix
PORT=5001
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

The frontend uses `http://localhost:5001/api` by default. Override it with `VITE_API_URL` when needed.

## Main API routes

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/services
GET  /api/services/:id
GET  /api/professionals
GET  /api/professionals/:id
POST /api/bookings
GET  /api/bookings
PATCH /api/bookings/:id/status
POST /api/reviews
```

The Services and Professionals pages load their data from the API, so PostgreSQL and the backend should be running before opening those pages.

## Validate

```bash
npm run build
cd backend && node --check src/server.js
curl http://localhost:5001/api/health
```
