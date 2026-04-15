# Cal Clone - Full Stack Scheduling App

A Cal.com-inspired scheduling app with:

- React + Vite + Tailwind frontend
- Express + Prisma backend
- PostgreSQL database

## Project Structure

```text
cal_cursor/
  client/                # React frontend
  server/                # Express API + Prisma
```

## Features

- Event Types CRUD (`title`, `description`, `duration`, `slug`, `bufferTime`, `questions`)
- Weekly availability by day (`Mon-Sun`) with timezone
- Public booking page: `/book/:slug`
- Available slot generation with overlap protection + buffer time
- Booking form (`name`, `email`) + confirmation page
- Dashboard with upcoming/past bookings + cancellation
- Date overrides (block/custom date windows)
- Rescheduling via `rescheduleToken`
- Optional email notifications via Nodemailer SMTP
- Responsive, minimal UI with rounded cards and soft shadows

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

### ORM (Prisma)

Prisma is already added to **`server/`** (`prisma` dev dependency + `@prisma/client`, schema under `server/prisma/`. You do **not** need to run `npx prisma init` again unless you are starting a fresh project.

Install deps from the repo root:

```bash
cd server
npm install
```

### 1) Backend environment

```bash
cd server
cp .env.example .env
```

- **Local Postgres:** set both `DATABASE_URL` and `DIRECT_URL` to the same connection string (see `.env.example`).
- **Supabase:** use a **pooled** URL for `DATABASE_URL` (PgBouncer, often port `6543`) and a **direct** URL for `DIRECT_URL` (often port `5432`). Copy `server/.env.local.example` to **`server/.env.local`**, fill in `[YOUR-PASSWORD]`, and keep **`server/.env`** for non-secret defaults (or merge the two URLs into `.env` only).

The `npm` scripts use `dotenv -c` so **`.env.local` is merged with `.env`** (same pattern as many frameworks): values in `.env.local` win for duplicate keys.

Then run:

```bash
npm run prisma:generate
```

Apply the database schema (pick one):

- **Preferred (tracked migrations):** `npm run prisma:deploy`  
  If you have no database yet, `npm run prisma:migrate -- --name init` also works and will create/apply migrations locally.

- **Quick alternative (prototypes):** `npm run prisma:push`

Then load demo data and start the API:

```bash
npm run prisma:seed
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Optional: Supabase Agent Skills (AI tooling)

If you use Cursor Agent Skills for Supabase workflows:

```bash
npx skills add supabase/agent-skills
```

## Seed Data

`server/prisma/seed.js` creates:

- 1 demo host user
- 1 event type (`demo-intro-call`)
- weekday availability slots
- one blocked date override example

Public booking URL after seeding:

`http://localhost:5173/book/demo-intro-call`

## REST API Routes

### Health

- `GET /api/health` - API liveliness check.

### Users

- `GET /api/users/default` - Returns the default seeded host user.

### Event Types

- `GET /api/event-types?userId=<id>` - List event types for a user.
- `POST /api/event-types` - Create a new event type.
- `PATCH /api/event-types/:id` - Update event type fields.
- `DELETE /api/event-types/:id` - Delete an event type.

### Availability

- `GET /api/availability?userId=<id>` - Read weekly availability slots.
- `PUT /api/availability` - Replace weekly availability slots (deduplicated server-side).

### Bookings

- `GET /api/bookings/public/:slug` - Fetch public event info for booking page.
- `GET /api/bookings/public/:slug/slots?date=YYYY-MM-DD` - List available slots for a date.
- `POST /api/bookings` - Create booking (past-time and overlap protected).
- `GET /api/bookings/dashboard?userId=<id>` - Upcoming and past/cancelled bookings.
- `PATCH /api/bookings/:id/cancel` - Cancel a booking.
- `PATCH /api/bookings/reschedule/:token` - Reschedule via token (token validation + expiry).
- `GET /api/bookings/overrides?eventTypeId=<id>` - List date overrides.
- `POST /api/bookings/overrides` - Create/update date override.

## Example Request Bodies

### Create Event Type

```json
{
  "userId": "user_id",
  "title": "30 min Intro Call",
  "description": "Quick sync call",
  "duration": 30,
  "slug": "intro-call",
  "bufferTime": 10,
  "questions": [
    { "id": "goal", "label": "Goal for this meeting", "type": "textarea", "required": true }
  ]
}
```

### Update Availability

```json
{
  "userId": "user_id",
  "slots": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "timezone": "Asia/Kolkata" }
  ]
}
```

### Create Booking

```json
{
  "eventTypeId": "event_type_id",
  "startTime": "2026-08-10T09:00:00.000Z",
  "attendeeName": "Jane Doe",
  "attendeeEmail": "jane@example.com"
}
```

## Notes

- SMTP variables are optional; emails are sent only when SMTP config is present.
- The `prisma` CLI package is pinned to **the same major version as `@prisma/client` (v6)** so migrations and codegen stay compatible.

## Assumptions

- Single-host workflow in the UI: dashboard and forms use the default seeded user from `GET /api/users/default`.
- Times are saved as local `HH:mm` ranges in availability and combined with selected date for slot generation.
- `rescheduleToken` expiry is enforced in backend logic (30 days from booking creation).

## Troubleshooting

### `GET /api/users/default` returns 500 or 503

Common causes:

1. **Missing `DIRECT_URL`** — After enabling `directUrl` in `schema.prisma`, you must define **`DIRECT_URL`** (and **`DATABASE_URL`**) in `server/.env` and/or `server/.env.local`. Prisma CLI reads them via `npm` scripts (`dotenv -c`).
2. **Tables do not exist yet** — Run `npm run prisma:deploy` (or `npm run prisma:push`) inside `server`, then `npm run prisma:seed`.
3. **No rows in `User`** — The seed script creates a demo user; run `npm run prisma:seed`.
4. **Supabase pooler / PgBouncer** — Use **`DIRECT_URL`** with the **direct** host/port from Supabase for migrations; keep the **pooled** URL in **`DATABASE_URL`** for the app. If `migrate` still struggles, try Session mode or `npm run prisma:push` against the direct URL once.
5. **Wrong / unreachable database URL** — Confirm the DB is up and the URL matches your provider’s expected format.
