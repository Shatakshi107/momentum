import { NextResponse } from "next/server";
import { reviewPullRequest } from "@/lib/review";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { prUrl } = await req.json();
    return NextResponse.json(await reviewPullRequest(String(prUrl ?? "")));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
