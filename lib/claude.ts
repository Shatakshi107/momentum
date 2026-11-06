import Anthropic from "@anthropic-ai/sdk";

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
