import { NextResponse } from "next/server";
import { matchIssues } from "@/lib/match";
import { askAnything } from "@/lib/ask";
import { shieldComment, safetyScan } from "@/lib/tone";
import { buildProof } from "@/lib/proof";

export const maxDuration = 300;

// One route for the single-call features: /api/ai/match, /ask, /tone, /safety, /proof
const handlers: Record<string, (body: Record<string, string>) => Promise<unknown>> = {
  match: () => matchIssues(),
  ask: (b) => askAnything(b.question ?? ""),
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
