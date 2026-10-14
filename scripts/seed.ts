// Run with: npm run seed
// Reads every JSON file in data/repo/ and puts the nodes and edges into the database.
// Target: Turso if TURSO_DATABASE_URL is set (in .env.local or the environment), otherwise local roadmap.db.
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { fromRepoJson, type RepoJson } from "../lib/convert";

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
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:roadmap.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await db.batch(
    [
      "DROP TABLE IF EXISTS nodes",
      "DROP TABLE IF EXISTS edges",
      `CREATE TABLE nodes (
        roadmap TEXT NOT NULL,
        id      TEXT NOT NULL,
        type    TEXT NOT NULL,
        label   TEXT,
        x REAL, y REAL, w REAL, h REAL,
        data    TEXT,
        done    INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (roadmap, id)
      )`,
      `CREATE TABLE edges (
        roadmap TEXT NOT NULL,
        id      TEXT NOT NULL,
        source  TEXT NOT NULL,
        target  TEXT NOT NULL,
        source_handle TEXT,
        target_handle TEXT,
        style   TEXT,
        PRIMARY KEY (roadmap, id)
      )`,
    ],
    "write"
  );

  const folder = path.join(root, "data", "repo");
  for (const file of fs.readdirSync(folder).filter((f) => f.endsWith(".json"))) {
    const slug = file.replace(".json", "");
    const json = JSON.parse(fs.readFileSync(path.join(folder, file), "utf8")) as RepoJson;
    const { nodes, edges } = fromRepoJson(json);

    await db.batch(
      [
        ...nodes.map((n) => ({
          sql: "INSERT INTO nodes (roadmap, id, type, label, x, y, w, h, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [slug, n.id, n.type, n.label, n.x, n.y, n.w, n.h, JSON.stringify(n.data)],
        })),
        ...edges.map((e) => ({
          sql: "INSERT INTO edges (roadmap, id, source, target, source_handle, target_handle, style) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [slug, e.id, e.source, e.target, e.sourceHandle, e.targetHandle, JSON.stringify(e.style)],
        })),
      ],
      "write"
    );
    console.log(`${slug}: ${nodes.length} nodes, ${edges.length} edges`);
  }
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
