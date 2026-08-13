# Celebration Planner

A multi-day event planner for hosts — plan a wedding (any tradition), a
religious ceremony, a birthday, or any other multi-day celebration by
describing it in plain language, then share one link for guests to RSVP.

## Features

- **Host login** — email/password accounts, sessions handled by NextAuth (Auth.js).
- **AI-generated itineraries** — describe the celebration ("3-day Hindu
  wedding in Jaipur for Anjali & Rohan") and get a full day-by-day schedule
  (ceremony names, times, locations, dress codes) that you can edit before
  publishing. Works for weddings across traditions (Hindu, Muslim, Christian,
  Jewish, etc.), birthdays, anniversaries, baby showers, and more.
- **Simple RSVP flow** — guests open a single link, see the itinerary, and
  RSVP yes/no/maybe — including which specific days they'll attend for
  multi-day events — with no account required.
- **Host dashboard** — manage each celebration's itinerary, copy the guest
  link, and see a live RSVP summary (headcounts, dietary notes, messages).

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Prisma](https://www.prisma.io) + SQLite for the database (file-based, zero setup)
- [NextAuth (Auth.js) v5](https://authjs.dev) with the Credentials provider for host login
- [Anthropic Claude](https://www.anthropic.com) for AI itinerary generation, with a
  built-in rule-based fallback generator so the app works even without an API key

## Getting started

```bash
npm install
cp .env.example .env      # then fill in AUTH_SECRET (and ANTHROPIC_API_KEY if you have one)
npx prisma migrate deploy # creates prisma/dev.db and applies the schema
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up as a host, and
create your first celebration.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite connection string, defaults to `file:./dev.db` |
| `AUTH_SECRET` | Yes | Random secret used to sign session tokens. Generate with `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | No | Enables real AI-generated itineraries. Without it, a built-in template generator produces a reasonable itinerary based on keywords in the prompt (tradition, day count, etc.), so the app is fully usable out of the box |
| `ANTHROPIC_MODEL` | No | Overrides the Claude model used for generation |
| `AUTH_TRUST_HOST` | Only in some self-hosted setups | Auth.js trusts the request Host header by default in this app (`trustHost: true` in `src/auth.ts`) since it isn't deployed on Vercel; only needed if you change that |

## How it works

1. **Host signs up / logs in** (`/signup`, `/login`) — credentials are hashed with bcrypt.
2. **Create a celebration from a prompt** (`/dashboard/new`) — the prompt is
   sent to `/api/events/generate`, which asks Claude for a structured JSON
   itinerary (days → agenda items with time/title/location/dress code). Every
   field is editable before saving.
3. **Save** — creates the `Event`, its `EventDay`s and `EventItem`s, and a
   unique public slug (`/dashboard` → `/api/events`).
4. **Manage** (`/dashboard/[id]`) — edit the itinerary, copy the guest link,
   and watch RSVPs come in.
5. **Guests RSVP** (`/rsvp/[slug]`, public, no login) — see the full
   itinerary and submit their name, attendance status, guest count, which
   days they'll join (for multi-day events), dietary notes, and a message.

## Data model

- `User` — a host account
- `Event` — one celebration (title, tradition, location, cover note, public slug, original prompt)
- `EventDay` — one day of the celebration, ordered
- `EventItem` — one agenda item within a day (time, title, location, dress code, description)
- `Rsvp` — a guest response (status, guest count, which days, dietary notes, message)

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npx prisma studio  # browse the SQLite database in a GUI
```
