import { z } from "zod";
import { structured, isMock } from "./claude";
import hero from "@/data/hero.json";
import heroPr from "@/data/hero-pr.json";

// Proof profile (#5): turns what she shipped into evidence-backed resume lines,
// and flags where her own words undersell it.

export const ProofSchema = z.object({
  bullets: z.array(
    z.object({
      text: z.string().describe("Resume bullet: strong verb, what, impact. Max 25 words. Only claims the evidence supports."),
      evidence: z.string().describe("The specific file, test or review exchange that proves it"),
    }),
  ).describe("Exactly 3 bullets, strongest first"),
  underselling: z.array(
    z.object({
      phrase: z.string().describe("Exact words from her draft"),
      why: z.string(),
      rewrite: z.string(),
    }),
  ),
  skills_shown: z.array(z.string()),
  linkedin_post: z.string().describe("Short first-person post, under 80 words, proud but factual"),
});
export type Proof = z.infer<typeof ProofSchema>;

const SYSTEM = `You help a first-time open-source contributor describe her work accurately. Women often undersell their contributions; your job is accuracy, not hype.
- Every claim must be backed by the PR evidence. Never invent impact numbers.
- Flag minimizing words in her draft ("just", "small", "helped", "some") and explain what the evidence actually shows.`;

export async function buildProof(): Promise<Proof & { mock: boolean }> {
  if (isMock()) return { ...MOCK, mock: true };
  const out = await structured(
    ProofSchema,
    SYSTEM,
    `Her profile and draft:\n${JSON.stringify(hero, null, 1)}\n\nHer merged PR and review history:\n${JSON.stringify(heroPr, null, 1)}`,
    "medium",
  );
  return { ...out, mock: false };
}

const MOCK: Proof = {
  bullets: [
    {
      text: "Fixed a crash in tinyml-kit's DataLoader when the final batch is empty, unblocking training on datasets of any size",
      evidence: "PR #547: early-return guard in tinyml/data/loader.py; issue had 6 user reports",
    },
    {
      text: "Wrote 3 edge-case unit tests covering uneven, empty and single-item batches; all pass in CI",
      evidence: "tests/test_loader.py added in PR #547",
    },
    {
      text: "Updated DataLoader docs to explain drop_last behavior, addressing a recurring user confusion",
      evidence: "docs/data.md change in PR #547, requested by the maintainer in review",
    },
  ],
  underselling: [
    { phrase: "just helped fix", why: "You wrote the fix yourself; the maintainer only reviewed it.", rewrite: "Fixed" },
    { phrase: "a small bug", why: "It crashed training for anyone whose dataset size wasn't divisible by the batch size; 6 users reported it.", rewrite: "a crash affecting training on uneven datasets" },
    { phrase: "some docs", why: "You documented a specific behavior the maintainer asked for.", rewrite: "the drop_last documentation" },
  ],
  skills_shown: ["Python", "PyTorch data pipelines", "Unit testing with pytest", "Reading an unfamiliar codebase", "Responding to code review"],
  linkedin_post:
    "My first open-source PR just got merged into tinyml-kit! I fixed a crash in the DataLoader when the last batch is empty, added edge-case tests, and documented drop_last. Thanks to my mentor and the maintainers for a thoughtful review. On to the next one.",
};
