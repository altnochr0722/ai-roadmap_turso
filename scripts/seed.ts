// Run with: npm run seed
// Reads every JSON file in data/repo/ and puts the nodes and edges into the database.
// Target: Turso if TURSO_DATABASE_URL is set (in .env.local or the environment), otherwise local roadmap.db.
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { seedDatabase } from "../lib/seed";

const root = process.cwd();

// tiny .env.local loader so this works the same on Windows/macOS/Linux
for (const name of [".env.local", ".env"]) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:roadmap.db";
  console.log("Seeding:", url);
  const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  for (const line of await seedDatabase(db, root)) console.log(line);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
