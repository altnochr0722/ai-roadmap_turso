import { createClient, type Client } from "@libsql/client";
import type { Roadmap } from "./types";

interface NodeRow {
  id: string;
  type: string;
  label: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  data: string;
  done: number;
}

interface EdgeRow {
  id: string;
  source: string;
  target: string;
  source_handle: string | null;
  target_handle: string | null;
  style: string;
}

// On Vercel: set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN.
// Locally with no env vars it falls back to the roadmap.db file, so `npm run dev` still works.
export function getClient(): Client {
  return createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:roadmap.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// All nodes and edges of one roadmap, in the same shape as lib/convert.ts
export async function getRoadmap(slug: string): Promise<Roadmap> {
  const db = getClient();
  try {
    const [nodeRes, edgeRes] = await Promise.all([
      db.execute({ sql: "SELECT * FROM nodes WHERE roadmap = ?", args: [slug] }),
      db.execute({ sql: "SELECT * FROM edges WHERE roadmap = ?", args: [slug] }),
    ]);
    const nodeRows = nodeRes.rows as unknown as NodeRow[];
    const edgeRows = edgeRes.rows as unknown as EdgeRow[];

    return {
      nodes: nodeRows.map((r) => ({
        id: r.id,
        type: r.type,
        label: r.label ?? "",
        x: Number(r.x),
        y: Number(r.y),
        w: Number(r.w),
        h: Number(r.h),
        data: JSON.parse(r.data),
        done: Number(r.done),
      })),
      edges: edgeRows.map((r) => ({
        id: r.id,
        source: r.source,
        target: r.target,
        sourceHandle: r.source_handle ?? "",
        targetHandle: r.target_handle ?? "",
        style: JSON.parse(r.style),
      })),
    };
  } finally {
    db.close();
  }
}

export async function listRoadmaps(): Promise<string[]> {
  const db = getClient();
  try {
    const res = await db.execute("SELECT DISTINCT roadmap FROM nodes ORDER BY roadmap");
    return res.rows.map((r) => String(r.roadmap));
  } finally {
    db.close();
  }
}

export async function toggleDone(slug: string, id: string): Promise<void> {
  const db = getClient();
  try {
    await db.execute({ sql: "UPDATE nodes SET done = 1 - done WHERE roadmap = ? AND id = ?", args: [slug, id] });
  } finally {
    db.close();
  }
}

export async function resetProgress(slug: string): Promise<void> {
  const db = getClient();
  try {
    await db.execute({ sql: "UPDATE nodes SET done = 0 WHERE roadmap = ?", args: [slug] });
  } finally {
    db.close();
  }
}
