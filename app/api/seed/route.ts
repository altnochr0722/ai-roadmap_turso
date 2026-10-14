import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// One-time seeding from the deployed site (useful when your own computer can't reach Turso).
// Disabled unless SEED_SECRET is set. Open: /api/seed?key=<SEED_SECRET>
// WARNING: this wipes all saved progress. Remove SEED_SECRET in Vercel when you are done.
export async function GET(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (new URL(request.url).searchParams.get("key") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const db = getClient();
  try {
    return NextResponse.json({ ok: true, seeded: await seedDatabase(db) });
  } finally {
    db.close();
  }
}
