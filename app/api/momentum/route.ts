import { runMomentum, type MomentumEvent } from "@/lib/momentum";

export const maxDuration = 300;

// Streams the agent's work as NDJSON: one {type: "step" | "action" | "done" | "error"} per line.
export async function POST(req: Request) {
  const { question, signals } = (await req.json().catch(() => ({}))) as { question?: string; signals?: string[] };
  let q = question || "Who is at risk of dropping off this week, and what should I do?";
  if (signals?.length) q += `\n\nNew self-reported check-ins since the last run (treat as fresh evidence):\n${signals.map((s) => `- ${s}`).join("\n")}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: MomentumEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await runMomentum(q, emit);
      } catch (e) {
        emit({ type: "error", error: (e as Error).message });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" } });
}
