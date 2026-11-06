import { NextResponse } from "next/server";
import { runMomentum } from "@/lib/momentum";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    return NextResponse.json(await runMomentum(String(question || "Who is at risk of dropping off this week, and what should I do?")));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
