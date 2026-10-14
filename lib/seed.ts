import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { fromRepoJson, type RepoJson } from "./convert";

// Drops and recreates the tables, then loads every JSON file in data/repo/.
// Used by scripts/seed.ts (npm run seed) and by app/api/seed (seed from Vercel).
export async function seedDatabase(db: Client, root = process.cwd()): Promise<string[]> {
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

  const log: string[] = [];
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
    log.push(`${slug}: ${nodes.length} nodes, ${edges.length} edges`);
  }
  return log;
}
