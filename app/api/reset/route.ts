import { NextResponse } from "next/server";
import { resetProgress } from "@/lib/db";
import { listRoadmaps } from "@/lib/roadmaps";

export async function POST(request: Request) {
  const { roadmap } = (await request.json()) as { roadmap: string };
  if (!listRoadmaps().includes(roadmap)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await resetProgress(roadmap);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
