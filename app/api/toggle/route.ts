import { NextResponse } from "next/server";
import { toggleDone } from "@/lib/db";

export async function POST(request: Request) {
  const { roadmap, id } = (await request.json()) as { roadmap: string; id: string };
  await toggleDone(roadmap, id);
  return NextResponse.json({ ok: true });
}
