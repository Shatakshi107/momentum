import { z } from "zod";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { client, MODEL, FALLBACK, isMock } from "./claude";
import cohort from "@/data/cohort.json";

// The Momentum agent investigates the cohort with tools, diagnoses WHY each
// person is stalled, and proposes the action that fixes the cause.
// Hidden outcome fields (prefixed "_outcome") are never shown to the agent;
// they exist only for the backtest you build on hackathon day.

type Participant = (typeof cohort.participants)[number];

function publicView(p: Participant) {
  // Strip ground-truth fields so the agent can't peek at the answer key.
  return Object.fromEntries(Object.entries(p).filter(([k]) => !k.startsWith("_outcome")));
}

export type Action = {
  participant_id: string;
  diagnosis: "waiting_on_maintainer" | "overwhelmed_by_review" | "stuck_starting" | "mentor_unresponsive" | "needs_next_issue" | "on_track";
  evidence: string;
  action: "escalate_review_to_maintainer" | "break_review_into_steps" | "assign_smaller_issue" | "reassign_mentor" | "suggest_next_issue" | "send_message" | "none";
  message_draft: string;
  urgency: "today" | "this_week" | "watch";
};

export async function runMomentum(question: string): Promise<{ summary: string; actions: Action[]; mock: boolean }> {
  if (isMock()) return mockRun();

  const actions: Action[] = [];

  const listParticipants = betaZodTool({
    name: "list_participants",
    description: "List every participant with mentor, track and the day of their most recent activity. Call this first.",
    inputSchema: z.object({}),
    run: async () =>
      JSON.stringify({
        today: cohort.today,
        participants: cohort.participants.map((p) => ({
          id: p.id,
          name: p.name,
          mentor: p.mentor,
          track: p.track,
          last_activity_day: p.events.at(-1)?.day ?? null,
          open_prs: p.open_prs.length,
        })),
      }),
  });

  const getParticipant = betaZodTool({
    name: "get_participant",
    description: "Full activity timeline and open PRs (with who the PR is waiting on) for one participant.",
    inputSchema: z.object({ id: z.string() }),
    run: async ({ id }) => {
      const p = cohort.participants.find((x) => x.id === id);
      return p ? JSON.stringify(publicView(p)) : `No participant ${id}`;
    },
  });

  const getMentors = betaZodTool({
    name: "get_mentors",
    description: "Mentor load and responsiveness (days since last reply to any mentee).",
    inputSchema: z.object({}),
    run: async () => JSON.stringify(cohort.mentors),
  });

  const proposeAction = betaZodTool({
    name: "propose_action",
    description:
      "Record ONE diagnosis and action for a participant. Call once per participant who needs attention. The message_draft must be specific to their situation, warm, and under 80 words.",
    inputSchema: z.object({
      participant_id: z.string(),
      diagnosis: z.enum(["waiting_on_maintainer", "overwhelmed_by_review", "stuck_starting", "mentor_unresponsive", "needs_next_issue", "on_track"]),
      evidence: z.string().describe("The specific facts from the timeline that support the diagnosis"),
      action: z.enum(["escalate_review_to_maintainer", "break_review_into_steps", "assign_smaller_issue", "reassign_mentor", "suggest_next_issue", "send_message", "none"]),
      message_draft: z.string(),
      urgency: z.enum(["today", "this_week", "watch"]),
    }),
    run: async (input) => {
      actions.push(input);
      return "recorded";
    },
  });

  const final = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    output_config: { effort: "medium" },
    system: `You are the program co-pilot for an open-source mentorship program for women.
A participant going quiet is a symptom. Find the cause, then fix the cause:
- PR waiting on a maintainer for days -> that is the program's fault, escalate it, don't nag her.
- Heavy review she hasn't answered -> break it into small steps.
- Assigned but no commits -> offer a smaller issue or a pairing session.
- Mentor not replying -> reassign or escalate the mentor.
- Merged and then silent -> celebrate and suggest a next issue.
- An open PR with coach_readiness "needs_another_pass" that she hasn't touched for 3+ days since coached_on_day is a stall: she has feedback she hasn't acted on.
- A PR with coach_readiness "ready_for_human_review" still waiting on a maintainer is the program's fault.
Investigate with the tools, call propose_action for each person who needs attention, then finish with a summary for the organizer: plain text, no markdown, at most 3 sentences. Lead with the most important fix.`,
    messages: [{ role: "user", content: question }],
    tools: [listParticipants, getParticipant, getMentors, proposeAction],
  });

  const summary = final.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  return { summary, actions, mock: false };
}

function mockRun(): { summary: string; actions: Action[]; mock: boolean } {
  return {
    mock: true,
    summary:
      "6 of 12 participants need attention. Two are stalled by us, not by them: Jasmine's PR has waited 15 days on a maintainer, and Maya asked Mentor Nicole for help twice with no reply. Fix those two today.",
    actions: [
      {
        participant_id: "p02",
        diagnosis: "waiting_on_maintainer",
        evidence: "PR #398 opened day 6, waiting on maintainer for 15 days; she messaged her mentor on day 13.",
        action: "escalate_review_to_maintainer",
        message_draft:
          "Hi Jasmine, your PR #398 is solid and the delay is on our side, not yours. I've asked a maintainer to review it by Friday. Thanks for your patience!",
        urgency: "today",
      },
      {
        participant_id: "p09",
        diagnosis: "mentor_unresponsive",
        evidence: "Asked mentor Nicole for help on day 11 and day 15; Nicole last replied 9 days ago.",
        action: "reassign_mentor",
        message_draft:
          "Hi Maya, sorry your questions on #401 went unanswered. David is going to pair with you for 20 minutes this week to get the 3 review comments sorted.",
        urgency: "today",
      },
      {
        participant_id: "p03",
        diagnosis: "overwhelmed_by_review",
        evidence: "PR #377 got 9 comments including a blocker (missing tests) on day 4; no activity for 17 days.",
        action: "break_review_into_steps",
        message_draft:
          "Hi Sofia, 9 comments is a lot, and most are small. Want to start with just the test? Here's a similar test in the repo you can copy the shape of.",
        urgency: "this_week",
      },
      {
        participant_id: "p04",
        diagnosis: "stuck_starting",
        evidence: "Assigned an issue on day 3, no commits in 18 days; messaged mentor David on days 11 and 14.",
        action: "assign_smaller_issue",
        message_draft:
          "Hi Ana, getting started on a new codebase is the hardest part. Want to swap to #77 (a 2-hour contrast fix) and pair with David for 20 minutes to get set up?",
        urgency: "today",
      },
      {
        participant_id: "p06",
        diagnosis: "needs_next_issue",
        evidence: "First PR merged on day 12, no activity in the 9 days since.",
        action: "suggest_next_issue",
        message_draft:
          "Aaliyah, congrats on your first merge! Ready for round two? #215 builds directly on what you learned and is about the same size.",
        urgency: "this_week",
      },
      {
        participant_id: "p12",
        diagnosis: "needs_next_issue",
        evidence: "Merged on day 6, silent for 15 days. Docs track.",
        action: "suggest_next_issue",
        message_draft: "Hi Hannah, your docs PR was great. #521 is a docs-and-code tutorial if you want to stretch a bit.",
        urgency: "watch",
      },
    ],
  };
}
