# oddparty

OddParty is an event marketplace starter where people can create small events and attendees can discover events by region, filter them, and buy multiple ticket types in a single order.

## Stack

- **Next.js 14** (App Router)
- **Bun runtime + package manager**
- **shadcn/ui-style components** (local UI primitives)
- **SQLite via `better-sqlite3`**
- **Docker / Docker Compose**

## Features in this iteration

- Launch page with product positioning and roadmap callouts.
- Event feed page with search, region filter, and category filter.
- Per-event detail page with multiple ticket tiers.
- Ticket purchase form that allows multiple quantities in one checkout action.
- Organizer event creation form.
- Demo event seeding for local testing.

## Local run

```bash
bun install
bun run dev
```

Open http://localhost:3000.

## Seed demo data

Demo data auto-seeds when visiting `/events` and `/events/:id`, but you can run it manually:

```bash
bun run seed
```

## Docker Compose

```bash
docker compose up --build
```

Then open http://localhost:3000.

A named volume `oddparty_data` persists sqlite data in `/app/data`.

## Next roadmap hooks

Current UI already surfaces upcoming platform plans:

- Asaas payments
- QR-code tickets
- In-event extra sales (food, drinks, etc.)
