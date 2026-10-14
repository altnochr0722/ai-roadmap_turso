import { NextResponse } from "next/server";
import { resetProgress } from "@/lib/db";

export async function POST(request: Request) {
  const { roadmap } = (await request.json()) as { roadmap: string };
  await resetProgress(roadmap);
  return NextResponse.json({ ok: true });
}
