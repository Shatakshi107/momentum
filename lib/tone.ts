import { z } from "zod";
import { structured, isMock } from "./claude";
import threads from "@/data/threads.json";

// Tone shield (#4) and community safety watch (#9) share this one classifier.

export const ToneSchema = z.object({
  category: z.enum(["constructive", "blunt", "condescending", "hostile", "harassment"]),
  bias: z.boolean().describe("True if the comment relies on gender or other identity-based stereotypes"),
  bias_note: z.string().describe("Empty if bias is false; otherwise one sentence naming the stereotype"),
  shielded: z
    .string()
    .describe("What the reviewer actually needs, rewritten as calm, specific feedback. Keep every real technical point. Empty if the comment has no technical content."),
  next_steps: z.array(z.string()).describe("1-3 concrete actions she can take, in order"),
  reassurance: z.string().describe("One honest sentence for her. Not cheerleading; e.g. 'This is about the code, and the fix is small.'"),
  flag_organizer: z.boolean().describe("True for condescending, hostile or harassment"),
  flag_reason: z.string().describe("Empty if not flagged; otherwise the specific behavior an organizer should address"),
});
export type Tone = z.infer<typeof ToneSchema>;

const SYSTEM = `You protect first-time open-source contributors, mostly women, from harmful review comments without hiding real technical feedback.
- Separate the technical signal from the tone. Never drop a valid technical point.
- "blunt" = terse but about the code. "condescending" = belittles the person. "hostile" = attacks the person. "harassment" = identity-based insults or exclusion.
- Never excuse identity-based remarks. Flag them.
- The shielded version should read like a respectful senior engineer wrote it.`;

export async function shieldComment(input: { text: string; context?: string }): Promise<Tone & { mock: boolean }> {
  if (isMock()) return { ...MOCK_SHIELD, mock: true };
  const out = await structured(ToneSchema, SYSTEM, `Context: ${input.context ?? "PR review comment"}\n\nComment:\n${input.text}`, "medium");
  return { ...out, mock: false };
}

const SafetySchema = z.object({
  items: z.array(ToneSchema.pick({ category: true, bias: true, bias_note: true, flag_organizer: true, flag_reason: true }).extend({ id: z.string() })),
  summary: z.string().describe("2 sentences for the organizer: patterns, and who needs a conversation"),
});
export type Safety = z.infer<typeof SafetySchema>;

export async function safetyScan(): Promise<Safety & { mock: boolean; threads: typeof threads }> {
  if (isMock()) return { ...MOCK_SAFETY, mock: true, threads };
  const out = await structured(
    SafetySchema,
    SYSTEM + "\nYou are now scanning a whole program's comments for the organizer. Classify every item.",
    JSON.stringify(threads, null, 1),
    "medium",
  );
  return { ...out, mock: false, threads };
}

const MOCK_SHIELD: Tone = {
  category: "hostile",
  bias: false,
  bias_note: "",
  shielded:
    "When drop_last=False, the last batch can be smaller than batch_size, or empty. Your fix should handle that case directly rather than relying on drop_last. The DataLoader docs describe this behavior.",
  next_steps: [
    "Read the drop_last section of the DataLoader docs (5 min)",
    "Add a check in loader.py for a batch of length 0 and return early",
    "Add a test with a dataset whose size isn't divisible by batch_size",
  ],
  reassurance: "This is about one edge case in your code, not about you, and the fix is a few lines.",
  flag_organizer: true,
  flag_reason: "'Did you even read the docs?' attacks the contributor rather than the code. Worth a word with maintainer_b.",
};

const MOCK_SAFETY: Safety = {
  summary:
    "4 of 7 comments need attention, and 2 are identity-based. maintainer_b's tone is a pattern across two PRs; maintainer_c and participant_x need a direct conversation under the code of conduct.",
  items: [
    { id: "c1", category: "constructive", bias: false, bias_note: "", flag_organizer: false, flag_reason: "" },
    { id: "c2", category: "hostile", bias: false, bias_note: "", flag_organizer: true, flag_reason: "Attacks the contributor ('did you even read the docs?')" },
    { id: "c3", category: "constructive", bias: false, bias_note: "", flag_organizer: false, flag_reason: "" },
    { id: "c4", category: "harassment", bias: true, bias_note: "Suggests women don't belong in backend work", flag_organizer: true, flag_reason: "Identity-based exclusion in a program channel; code-of-conduct violation" },
    { id: "c5", category: "condescending", bias: true, bias_note: "'Sweetheart' and deferring to 'senior guys' assumes she's less capable because she's a woman", flag_organizer: true, flag_reason: "Gendered condescension from a maintainer" },
    { id: "c6", category: "blunt", bias: false, bias_note: "", flag_organizer: false, flag_reason: "" },
    { id: "c7", category: "constructive", bias: false, bias_note: "", flag_organizer: false, flag_reason: "" },
  ],
};
