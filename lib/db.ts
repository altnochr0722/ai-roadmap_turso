import { createClient, type Client } from "@libsql/client";

// The database only stores progress: one row per finished topic. The layout lives in data/repo/*.json.
// On Vercel set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN. Locally, with no env vars, it uses roadmap.db.
function getClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url && process.env.VERCEL) {
    throw new Error("TURSO_DATABASE_URL is not set in this Vercel environment");
  }
  return createClient({ url: url ?? "file:roadmap.db", authToken: process.env.TURSO_AUTH_TOKEN });
}

async function withDb<T>(fn: (db: Client) => Promise<T>): Promise<T> {
  const db = getClient();
  try {
    // creates the table the first time, nothing to seed
    await db.execute(
      "CREATE TABLE IF NOT EXISTS progress (roadmap TEXT NOT NULL, id TEXT NOT NULL, PRIMARY KEY (roadmap, id))"
    );
    return await fn(db);
  } finally {
    db.close();
  }
}

export function getDoneIds(slug: string): Promise<Set<string>> {
  return withDb(async (db) => {
    const res = await db.execute({ sql: "SELECT id FROM progress WHERE roadmap = ?", args: [slug] });
    return new Set(res.rows.map((r) => String(r.id)));
  });
}

export function toggleDone(slug: string, id: string): Promise<void> {
  return withDb(async (db) => {
    const del = await db.execute({ sql: "DELETE FROM progress WHERE roadmap = ? AND id = ?", args: [slug, id] });
    if (del.rowsAffected === 0) {
      await db.execute({ sql: "INSERT INTO progress (roadmap, id) VALUES (?, ?)", args: [slug, id] });
    }
  });
}

export function resetProgress(slug: string): Promise<void> {
  return withDb(async (db) => {
    await db.execute({ sql: "DELETE FROM progress WHERE roadmap = ?", args: [slug] });
  });
}
