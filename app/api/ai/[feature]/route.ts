import { NextResponse } from "next/server";
import { matchIssues } from "@/lib/match";
import { askAnything } from "@/lib/ask";
import { shieldComment, safetyScan } from "@/lib/tone";
import { buildProof } from "@/lib/proof";
import { checkIn } from "@/lib/checkin";

export const maxDuration = 300;

// One route for the single-call features: /api/ai/match, /ask, /checkin, /tone, /safety, /proof
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: Record<string, (body: any) => Promise<unknown>> = {
  match: (b) => matchIssues(b.repo ? String(b.repo) : undefined),
  ask: (b) => askAnything(b.question ?? "", b.image),
  checkin: (b) => checkIn(String(b.transcript ?? "")),
  tone: (b) => shieldComment({ text: b.text ?? "", context: b.context }),
  safety: () => safetyScan(),
  proof: () => buildProof(),
};

export async function POST(req: Request, ctx: RouteContext<"/api/ai/[feature]">) {
  const { feature } = await ctx.params;
  const handler = handlers[feature];
  if (!handler) return NextResponse.json({ error: `Unknown feature: ${feature}` }, { status: 404 });
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json(await handler(body));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
