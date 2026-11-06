import { z } from "zod";
import { readFileSync } from "node:fs";
import { structured, isMock, type UserContent } from "./claude";
import hero from "@/data/hero.json";

// Private ask-anything (#2): answers from the repo's own docs, or hands off to
// her mentor with a brief so she never has to ask in public.

export const AskSchema = z.object({
  mode: z.enum(["answer", "escalate"]),
  answer: z.string().describe("If answer: a clear, kind explanation grounded in the repo context. If escalate: one sentence telling her who will help and why."),
  look_at: z.array(z.string()).describe("Files or commands she should look at next"),
  mentor_brief: z
    .string()
    .describe("Only when escalating: 3 lines for the mentor (who, what she's trying to do, the exact decision needed). Empty otherwise."),
});
export type Ask = z.infer<typeof AskSchema>;

const SYSTEM = `You are a private, patient helper for a first-time contributor. There are no dumb questions.
Answer from the repo context below when you can. Escalate to her mentor when the question needs a human decision (public API changes, design choices, permission) or the context doesn't cover it. Never guess about project policy.`;

export type AskImage = { data: string; media_type: "image/png" | "image/jpeg" | "image/gif" | "image/webp" };

export async function askAnything(question: string, image?: AskImage): Promise<Ask & { mock: boolean }> {
  if (isMock()) {
    if (image) return { ...MOCK_SCREENSHOT, mock: true };
    return { ...(/api|argument|parameter|change|export|allowed|permission/i.test(question) ? MOCK_ESCALATE : MOCK_ANSWER), mock: true };
  }
  const repo = readFileSync("./data/repo-context.md", "utf8");
  const out = await structured(
    AskSchema,
    `${SYSTEM}\n\n<repo_context>\n${repo}\n</repo_context>`,
    userTurn(`Contributor: ${hero.name}, ${hero.year}, mentor: Nicole. Working on issue #512.\nQuestion: ${question || "What does this error mean and how do I fix it?"}`, image),
    "low",
  );
  return { ...out, mock: false };
}

// Screenshot help: an error screenshot goes in as an image block before the question.
function userTurn(text: string, image?: AskImage): UserContent {
  if (!image) return text;
  return [
    { type: "image", source: { type: "base64", media_type: image.media_type, data: image.data } },
    { type: "text", text: `${text}\n(She attached a screenshot. Read it carefully, quote the key error line, and explain it in plain language.)` },
  ];
}

const MOCK_SCREENSHOT: Ask = {
  mode: "answer",
  answer:
    "The key line is \"ModuleNotFoundError: No module named 'tinyml'\". Python can't find the project because it isn't installed in your virtual environment yet. This is a setup step, not a bug in your code. Activate the venv, then install the project in editable mode, and the tests will be able to import it.",
  look_at: ["source .venv/bin/activate", "pip install -e \".[dev]\"", "pytest -q"],
  mentor_brief: "",
};

const MOCK_ANSWER: Ask = {
  mode: "answer",
  answer:
    "collate_fn takes a list of samples and turns it into one batch, stacking them into tensors (and padding sequences if pad=True). The crash in #512 happens before that: the DataLoader calls collate_fn with an empty list. So the fix belongs in loader.py's __iter__, not in collate.py.",
  look_at: ["tinyml/data/loader.py (__iter__)", "tinyml/data/collate.py", "pytest -q tests/"],
  mentor_brief: "",
};

const MOCK_ESCALATE: Ask = {
  mode: "escalate",
  answer: "That's a public API change, which needs a maintainer's OK first. I've sent your question to Nicole with context so you don't have to explain it again.",
  look_at: ["CONTRIBUTING: 'Public API changes need maintainer approval'"],
  mentor_brief:
    "Maya (community college, first PR, fixing issue #512) wants to add a `skip_empty` argument to DataLoader.\nThat changes the public API, so per CONTRIBUTING it needs maintainer approval.\nDecision needed: approve the new argument, or point her to the guard-only fix.",
};
