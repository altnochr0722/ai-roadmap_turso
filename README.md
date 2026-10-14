# AI Engineer Roadmap

Next.js 15 + TypeScript + Tailwind CSS 4 + shadcn/ui, with progress stored in Turso (SQLite).

The roadmap layout is the real roadmap.sh JSON (`ai-engineer.json`, `frontend.json`) in `data/repo/`.
It is bundled into the app, so there is **nothing to seed**. The database only stores which topics you finished
(table `progress`, created automatically on first use).

- `/` - AI Engineer roadmap, progress saved in the database
- `/frontend` - Frontend roadmap, progress saved in the database
- `/static` - same layout, no database, checkmarks are not saved

## Run locally

```
npm install
npm run dev      # http://localhost:3000, progress goes to a local roadmap.db file
```

## Deploy to Vercel

1. Create a free database at turso.tech and copy its URL (`libsql://...`) and an auth token.
2. Push this project to GitHub and import it at vercel.com/new.
3. In Project Settings -> Environment Variables add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, then redeploy.

Never commit real values: put them only in Vercel (and in `.env.local`, which is git-ignored).
If the database is unreachable the roadmap still shows, with a warning that progress can't be saved.

To add another roadmap: copy its JSON into `data/repo/` and add one line in `lib/roadmaps.ts`.

## Files

- `lib/roadmaps.ts` - loads the JSON layouts
- `lib/db.ts` - progress storage (libSQL / Turso)
- `lib/convert.ts`, `lib/types.ts` - JSON conversion and types
- `components/roadmap.tsx` - draws the boxes and SVG lines, progress card
- `components/ui/*` - shadcn/ui components
- `app/api/toggle`, `app/api/reset` - save progress
