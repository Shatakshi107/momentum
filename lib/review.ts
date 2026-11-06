import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { client, MODEL, FALLBACK, isMock } from "./claude";
import { fetchPullRequest, prToPrompt, type PullRequest } from "./github";
import mockReview from "@/data/mock-review.json";
import demoPr from "@/data/hero-pr.json";

// What the Review Coach returns. Two audiences in one pass:
// the contributor gets teaching, the maintainer gets a 30-second triage.
export const ReviewSchema = z.object({
  readiness: z.enum(["ready_for_human_review", "needs_another_pass", "needs_understanding_check"]),
  maintainer_summary: z.string().describe("3 lines max: what changed, risk, what a human should look at"),
  strengths: z.array(z.string()).describe("Specific things the contributor did well"),
  coaching: z.array(
    z.object({
      file: z.string(),
      line_hint: z.string().describe("Line number or the code snippet it refers to"),
      severity: z.enum(["blocker", "should_fix", "nit"]),
      what: z.string().describe("What the issue is, in plain language"),
      why: z.string().describe("Why it matters in THIS codebase"),
      question: z.string().describe("A Socratic question that leads her to the fix without writing it"),
    }),
  ),
  understanding_check: z
    .array(z.string())
    .describe("2-3 questions about her own diff that someone who understands it can answer in a sentence"),
});
export type Review = z.infer<typeof ReviewSchema>;

const SYSTEM = `You are a patient senior maintainer coaching a first-time open-source contributor in a mentorship program.
Your job is to help her learn and get merged, and to save the human maintainer time.
Rules:
- Never write the fix for her. Explain what and why, then ask a question that leads her there.
- Be specific to this diff and this codebase. No generic advice.
- Lead with real strengths. Be warm, never condescending.
- If the diff looks generated without understanding (inconsistent with the codebase, unexplained changes, description doesn't match the code), set readiness to needs_understanding_check.
- maintainer_summary is for a busy maintainer: blunt and short.`;

export async function reviewPullRequest(prUrl: string): Promise<{ review: Review; mock: boolean; title: string }> {
  if (isMock()) return { review: ReviewSchema.parse(mockReview), mock: true, title: demoPr.title };

  // Empty URL or "demo" → Maya's demo PR, so the journey works without GitHub.
  const pr = !prUrl || prUrl === "demo" ? (demoPr as PullRequest) : await fetchPullRequest(prUrl);
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    output_config: { effort: "high", format: betaZodOutputFormat(ReviewSchema) },
    system: SYSTEM,
    messages: [{ role: "user", content: prToPrompt(pr) }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`Review did not complete (stop_reason: ${response.stop_reason})`);
  }
  return { review: response.parsed_output, mock: false, title: pr.title };
}
