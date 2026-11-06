# Momentum

**An AI co-pilot for open-source mentorship programs (GirlScript Summer of Code, Outreachy, GSoC-style cohorts) that keeps every participant moving and coaches every PR before a maintainer has to look at it.**

Built for *Code with Claude: Women in AI Hackathon* (Anthropic SF, Nov 6, 2026). Track: **Education and opportunity**.

## Pitch

Open-source programs are how thousands of women outside big tech hubs get their first real engineering experience, and most of them never finish. I ran GirlScript Summer of Code and saw why up close. Participants don't quit because they're lazy. They stall because their PR has waited two weeks for a maintainer, a nine-comment review felt like a wall, or their mentor stopped replying. Meanwhile maintainers are drowning in AI-generated PRs, so 2026 projects are closing the door on newcomers. Momentum is an agent that sits between participants, mentors and maintainers. It reviews every PR the way a patient senior engineer would, teaching instead of rewriting, and hands the maintainer a 30-second triage. It watches the whole cohort, finds *why* each person stalled, and fixes the cause, whether that's a slow review, a missing mentor or an issue that's too big. Programs stop measuring sign-ups and start measuring women who ship.

## What's in the starter

| Piece | File | Status |
|---|---|---|
| PR Review Coach (structured output, Opus 5.5) | `lib/review.ts`, `app/api/review` | Works live on any public PR |
| Momentum agent (tool-use loop over cohort data) | `lib/momentum.ts`, `app/api/momentum` | Works live; 4 tools |
| Synthetic cohort, 12 participants with hidden outcomes | `data/cohort.json` | Expand to ~40 on the day |
| UI with two tabs | `app/page.tsx` | Basic, ready to polish |
| Mock mode (no key → canned results, zero credits) | `lib/claude.ts`, `data/mock-review.json` | On when no key is set |

## Run it

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY (and optionally GITHUB_TOKEN)
npm run dev                   # http://localhost:3000
```

No key? It runs in mock mode, so you can build UI without spending credits. `MOCK=1` forces mock mode even with a key.

## Build plan (Nov 6, 9:00 to 3:00 PT)

| Time | Goal | Done when |
|---|---|---|
| 9:00–9:30 | Setup: key in `.env.local`, `gh repo create`, run one live review and one live momentum run | Both tabs return real Claude output |
| 9:30–10:45 | **Review Coach depth**: pick 2–3 real beginner PRs from GSSoC-style repos as demo cases; tune the prompt; add "post as GitHub comment" (copy-to-clipboard is fine) | A real PR gets coaching you'd be proud to show |
| 10:45–12:00 | **Momentum depth**: grow the cohort to ~40; show the agent's investigation trail (tool calls) live in the UI; one-click "send" on drafts (simulated) | Agent finds the 2 "our fault" stalls every run |
| 12:00–12:30 | Lunch at the keyboard; write the 3 GSSoC numbers or stories into the pitch | |
| 12:30–1:30 | **Close the loop**: the review result feeds momentum (a "needs_another_pass" PR left untouched for 3 days becomes a stall); **backtest** with hidden `_outcome_dropped_on_day` to show how many dropouts were caught and how early | One metric on screen: "caught X of Y dropouts, Z days early" |
| 1:30–1:45 | **Feature freeze.** Fix bugs only | |
| 1:45–2:30 | README, record the 2–3 min demo video (script below), push | Video file exists |
| 2:30–3:00 | Submit the form (video + repo link). Buffer | Submitted |

**If behind:** cut the backtest UI and show the metric as text. Never cut the live PR review, which is the demo's wow moment.

## Demo video script (2:30)

1. **0:00 Problem (25s).** "I ran GirlScript Summer of Code. Thousands of women sign up; most never finish. Here's why." Show 3 stall reasons.
2. **0:25 Review Coach (50s).** Paste a real beginner PR. Show strengths, a Socratic question instead of a fix, the understanding check, and the maintainer's 3-line triage.
3. **1:15 Momentum (50s).** Ask "Who's at risk this week?" Show the agent investigating, then: "Fatima's PR has waited 15 days on *us*. Escalating it, not nagging her."
4. **2:05 Impact (25s).** Backtest number, plus "Programs measure sign-ups. Momentum measures women who ship."

## Notes

- Model: `claude-opus-5-5` with server-side refusal fallback (`fallbacks: "default"`). Override with `CLAUDE_MODEL`.
- Each participant gets $100 in credits. A PR review costs a few cents, so you can run dozens.
- The cohort data is synthetic. Don't put real participants' data in the repo.
