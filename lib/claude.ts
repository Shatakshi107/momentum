import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

// One shared client. Credentials come from ANTHROPIC_API_KEY in .env.local
// (or an `ant auth login` profile).
export const client = new Anthropic();

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

// Server-side refusal fallback: if a request is declined, the API re-runs it on
// Anthropic's recommended fallback model inside the same call.
export const FALLBACK = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default" as const,
};

// Mock mode lets you build the UI all morning without spending API credits.
// On by default when no key is set; force it with MOCK=1.
export function isMock(): boolean {
  return process.env.MOCK === "1" || !process.env.ANTHROPIC_API_KEY;
}


// One structured-output call. Every feature except the momentum agent goes through here.
export async function structured<S extends z.ZodType>(
  schema: S,
  system: string,
  user: string,
  effort: "low" | "medium" | "high" = "medium",
): Promise<z.infer<S>> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    output_config: { effort, format: betaZodOutputFormat(schema) },
    system,
    messages: [{ role: "user", content: user }],
  });
  if (response.stop_reason === "refusal" || response.parsed_output == null) {
    throw new Error(`Claude did not complete (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output as z.infer<S>;
}
