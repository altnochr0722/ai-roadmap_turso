import { NextResponse } from "next/server";
import { toggleDone } from "@/lib/db";
import { isValidTopic } from "@/lib/roadmaps";

export async function POST(request: Request) {
  const { roadmap, id } = (await request.json()) as { roadmap: string; id: string };
  if (!isValidTopic(roadmap, id)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await toggleDone(roadmap, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("toggle failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
