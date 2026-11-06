import { z } from "zod";
import { structured, isMock } from "./claude";
import hero from "@/data/hero.json";

// Voice check-in: she talks for 30 seconds (speech-to-text happens in the browser),
// Claude replies in a short spoken-style message and extracts signals for the program.

export const CheckinSchema = z.object({
  spoken_reply: z
    .string()
    .describe("What the app says back out loud. Warm, specific, under 60 words, no lists or markdown, sounds natural when spoken."),
  stress: z.enum(["low", "medium", "high"]),
  blockers: z.array(z.string()).describe("Concrete blockers she mentioned, in her terms"),
  wins: z.array(z.string()).describe("Progress she mentioned, even small"),
  next_step: z.string().describe("One small, doable next step for the next 30 minutes she has"),
  needs_human: z.boolean().describe("True if a mentor should reach out (stuck 2+ days, discouraged, or thinking of quitting)"),
  organizer_signal: z.string().describe("One line for the program co-pilot, e.g. 'Self-reported: tests failing 3 days, high stress, midterms'"),
});
export type Checkin = z.infer<typeof CheckinSchema>;

const SYSTEM = `You run a 30-second voice check-in for a first-time open-source contributor in a women's mentorship program.
- Listen for both the technical blocker and how she feels. Don't diagnose emotions beyond what she says.
- Reply like a calm, encouraging senior engineer friend. Normalize being stuck. Give one next step that fits the time she has.
- If she sounds like she might quit, set needs_human and say a real person will reach out today.`;

export async function checkIn(transcript: string): Promise<Checkin & { mock: boolean }> {
  if (isMock()) return { ...MOCK, mock: true };
  const out = await structured(
    CheckinSchema,
    SYSTEM,
    `Contributor: ${hero.name} (${hero.year}; ${hero.constraints}). Working on issue #512 (DataLoader empty-batch crash). Mentor: Nicole.\n\nTranscript of her voice check-in:\n"${transcript}"`,
    "low",
  );
  return { ...out, mock: false };
}

const MOCK: Checkin = {
  spoken_reply:
    "Three days on failing tests is really normal for a first PR, and it doesn't mean you're behind. Tonight on BART, just run the one failing test and read the last line of the error. I've also asked Nicole to check in with you today.",
  stress: "high",
  blockers: ["Tests failing for 3 days", "Not sure if the fix is in the right file"],
  wins: ["Reproduced the crash locally"],
  next_step: "Run only test_exact_multiple_no_empty_batch and read the last line of the error",
  needs_human: true,
  organizer_signal: "Self-reported: tests failing 3 days, high stress, midterms next week. Mentor Nicole asked to reach out.",
};
