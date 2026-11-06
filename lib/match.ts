import { z } from "zod";
import { structured, isMock } from "./claude";
import hero from "@/data/hero.json";
import issues from "@/data/issues.json";

// Issue matchmaker (#1): fits issues to her skills AND the hours she really has.

export const MatchSchema = z.object({
  matches: z.array(
    z.object({
      issue_id: z.string(),
      title: z.string(),
      fit: z.number().describe("0-100"),
      why_it_fits: z.string().describe("One sentence tied to HER skills, goal and constraints"),
      weeks_at_her_pace: z.number().describe("Realistic weeks given her hours per week, including learning time"),
      first_step: z.string().describe("The very first concrete thing to do, under 15 words"),
    }),
  ).describe("Top 3, best first"),
  avoid: z.array(z.object({ issue_id: z.string(), title: z.string(), reason: z.string() })).describe("The 2-3 most tempting issues that don't fit her right now; skip obvious mismatches"),
});
export type Match = z.infer<typeof MatchSchema>;

const SYSTEM = `You match first-time open-source contributors to issues. Your goal is her FIRST MERGED PR, not the most impressive issue.
- Respect her real time budget and constraints (exams, caregiving, shared devices). A first-timer needs roughly 2-3x the maintainer's estimate.
- Prefer issues aligned with her stated goal.
- Be honest in "avoid" about issues that are too big, need approval first, or don't match her skills.`;

export async function matchIssues(): Promise<Match & { mock: boolean }> {
  if (isMock()) return { ...MOCK, mock: true };
  const out = await structured(MatchSchema, SYSTEM, `Contributor:\n${JSON.stringify(hero, null, 1)}\n\nOpen issues:\n${JSON.stringify(issues, null, 1)}`, "medium");
  return { ...out, mock: false };
}

const MOCK: Match = {
  matches: [
    {
      issue_id: "#512",
      title: "DataLoader crashes on empty batch when drop_last=False",
      fit: 92,
      why_it_fits: "A real ML bug in code you've used in your PyTorch course, small enough to finish before exams, and a strong line for internship applications.",
      weeks_at_her_pace: 2,
      first_step: "Comment /assign on #512, then reproduce the crash locally",
    },
    {
      issue_id: "#540",
      title: "Add unit tests for confusion_matrix edge cases",
      fit: 84,
      why_it_fits: "Uses your NumPy skills, tests are the fastest way to learn a codebase, and it's very likely to merge.",
      weeks_at_her_pace: 1.5,
      first_step: "Read tests/test_metrics.py and list 3 edge cases",
    },
    {
      issue_id: "#521",
      title: "Notebook tutorial: fine-tuning on a custom CSV dataset",
      fit: 71,
      why_it_fits: "Plays to your pandas strength and is visible work, but it's more writing than code.",
      weeks_at_her_pace: 3,
      first_step: "Pick a small public CSV dataset and outline the notebook",
    },
  ],
  avoid: [
    { issue_id: "#530", title: "Implement mixed-precision training support", reason: "About 30 maintainer-hours; at 6 hrs/week with exams, this would take most of the program." },
    { issue_id: "#219", title: "Rewrite CLI with async plugin system", reason: "Architecture change; needs deep codebase knowledge and maintainer design approval." },
  ],
};
