# Momentum

**An AI co-pilot for open-source mentorship programs (GirlScript Summer of Code, Outreachy, GSoC-style cohorts) that keeps every participant moving and coaches every PR before a maintainer has to look at it.**

Built for *Code with Claude: Women in AI Hackathon* (Anthropic SF, Nov 6, 2026). Track: **Education and opportunity**.

## Pitch

In 2024 I was one of four program managers for GirlScript Summer of Code. **27,000 people registered. 17,000 became participants. They opened 11,000 PRs across 205 projects.** There were fewer PRs than participants, so even in the best case at least 6,000 people never opened a single one. And four of us were managing 17,000 people.

What I learned is that writing the code is rarely what stops someone. Setting up the repo, reading the contribution guidelines and *feeling allowed to ask* stops them. So do a review that sits for two weeks, or a comment that reads like "did you even read the docs?" That doesn't scale with heroics; it needs a system.

Momentum is that system. For each woman, it matches her to an issue that fits her real week, answers the questions she's afraid to ask in public, coaches her PR instead of rewriting it, shields her from hostile reviews, and turns what she shipped into proof for her resume. For organizers, it finds *why* each person stalled and fixes the cause. Programs stop measuring sign-ups and start measuring women who ship their first PR, and come back for a second.

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

## Features, build order and demo script

See **[FEATURES.md](FEATURES.md)**: 11 features (6 engines), one woman's journey from her first issue to a resume line, the program view, a cut-line build order for 9:00 to 3:00, and the 2:30 demo script.

Demo data ready to use: `data/ritika.json` (hero persona), `data/issues.json` (10 issues, mixed sizes), `data/threads.json` (review comments and chat messages, from kind to hostile), `data/cohort.json` (12 participants with hidden outcomes).

## Notes

- Model: `claude-opus-5-5` with server-side refusal fallback (`fallbacks: "default"`). Override with `CLAUDE_MODEL`.
- Each participant gets $100 in credits. A PR review costs a few cents, so you can run dozens.
- The cohort data is synthetic. Don't put real participants' data in the repo.
