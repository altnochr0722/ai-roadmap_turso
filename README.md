# AI Engineer Roadmap

Next.js 15 + TypeScript + Tailwind CSS 4 + shadcn/ui + SQLite (Turso / libSQL).

The data is the real roadmap.sh JSON from the
[developer-roadmap](https://github.com/nilbuild/developer-roadmap) repo
(`ai-engineer.json` and `frontend.json`), saved in `data/repo/`.

- `/static` — reads `data/repo/ai-engineer.json` directly (phase 1, no database)
- `/` — reads the same roadmap from the SQLite database `roadmap.db` (phase 2). Clicking a topic saves it as done.
- `/frontend` — the frontend roadmap, also from the database

## Run

```
npm install
npm run seed     # puts every JSON file in data/repo/ into roadmap.db
npm run dev      # open http://localhost:3000
```

To add another roadmap: copy its JSON from the repo into `data/repo/`, run `npm run seed`, open `/<file-name>`.
(Seeding resets the saved checkmarks.)

## Files

- `data/repo/*.json` — roadmap data copied from the repo
- `scripts/seed.ts` — puts the JSON into the database (tables: `nodes`, `edges`)
- `lib/convert.ts` — turns the repo JSON into a simple typed shape
- `lib/types.ts` — TypeScript types
- `lib/db.ts` — database read / update (better-sqlite3)
- `components/roadmap.tsx` — draws the boxes and the SVG lines, progress card
- `components/ui/*` — shadcn/ui components (button, card, badge, progress, separator)
- `app/api/toggle`, `app/api/reset` — save progress to the database

## Deploy to Vercel (with Turso)

Vercel's filesystem is read-only, so progress is stored in a hosted Turso database instead of `roadmap.db`.

1. Create a free account at turso.tech, then create a database (dashboard, or the Turso CLI: `turso db create ai-roadmap`).
2. Copy its URL (`libsql://...`) and create an auth token (`turso db tokens create ai-roadmap`).
3. Locally, copy `.env.example` to `.env.local` and fill in `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`.
4. Run `npm run seed` once. It loads the roadmaps into Turso (re-running it resets all progress).
5. Push the project to GitHub and import it at vercel.com/new.
6. In Vercel, Project Settings -> Environment Variables, add the same two variables, then deploy.

With no env vars set, everything still runs locally against `roadmap.db`.
