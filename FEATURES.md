# Momentum: feature spec

**Who it's for:** women in open-source mentorship programs (GSSoC, Outreachy, Women Who Code-style cohorts), plus the mentors, maintainers and organizers around them.

**Demo story:** follow one woman, **Maya (Oakland, community college CS, ML track, 6 hrs/week)**, from her first issue to a merged PR and a resume line. Then switch to the organizer's seat and show the system that kept her going.

## The problem, by user

| User | What makes them quit or fail | Evidence to cite |
|---|---|---|
| Participant | Picks an issue too big for her time; afraid to ask "dumb" questions in public; a harsh review feels personal; undersells what she shipped | Women's PRs were accepted *less* often when their gender was identifiable to outsiders (Terrell et al., *PeerJ CS* 2017); women downplay their own performance (Exley & Kessler, *QJE* 2022) |
| Mentor | 1 mentor : many mentees; can't tell who needs them today | Unprepared mentors lead to burnout (FOSS mentorship guides) |
| Maintainer | Flooded with AI-generated PRs; review time is scarce | GitHub's Feb 2026 PR restrictions; Hacktoberfest 2026 stopped counting PRs |
| Organizer | Finds out someone dropped only at the final report; measures sign-ups, not outcomes | ICSE 2026: retention tools are retrospective, not predictive |

### From my own program (GSSoC 2024, I was one of 4 program managers)

| Number | What it means for the pitch |
|---|---|
| 27,000+ registered, 17,000+ participants | About 10,000 people signed up and never became active participants. The drop starts before the first line of code. |
| 11,000+ PRs from 17,000+ participants | Fewer PRs than people, so **at least 6,000 participants never opened a PR**. |
| 4 program managers : 17,000+ participants | About 1 : 4,250. One-on-one help can't scale; it needs a system. |
| 205+ projects, 200+ institutes, 20+ countries | Hundreds of maintainers with different review styles and response times, which is where tone and waiting problems come from. |

**What I saw (my three lessons, mapped to features):**
1. *The first PR is the hardest. Repo setup, contribution guidelines and feeling allowed to ask stop people, not the code.* → #1 Issue matchmaker, #2 Private ask-anything
2. *Scale needs systems, not heroics.* → #6 Momentum agent, #8 Mentor inbox, #3 Review coach's maintainer triage
3. *Community is a product; retention is the metric.* → #10 Metrics (% reaching a 2nd PR), #11 Backtest, #4 Tone shield and #9 Safety watch protect the community

**Don't overclaim on stage:** "at least 6,000 never opened a PR" is the only safe derived number. Don't call the 11,000 "merged" PRs or claim a completion rate unless you have the real figure.

## Feature map

11 features, but only **6 things to build**, because several share one engine.

| # | Feature | User | Engine (what you actually build) | Depth on demo day | Est. |
|---|---|---|---|---|---|
| 1 | **Issue matchmaker** | Participant | `match.ts`: one structured-output call over `data/issues.json` + her profile | Thin | 40m |
| 2 | **Private ask-anything** | Participant | `ask.ts`: chat grounded in the repo's README + CONTRIBUTING; returns `answer` or `escalate` + a 3-line brief for the mentor | Thin | 45m |
| 3 | **PR review coach** | Participant + maintainer | `review.ts` ✅ built | Real | (done) |
| 4 | **Tone shield** | Participant | `tone.ts`: classify a review comment (constructive / blunt / condescending / hostile) → rewrite as clear next steps → flag if hostile | Real | 45m |
| 5 | **Proof profile** | Participant | `proof.ts`: merged PR + review history → 3 evidence-backed resume/LinkedIn bullets, with her own underselling flagged | Real | 35m |
| 6 | **Cohort momentum agent** | Organizer | `momentum.ts` ✅ built | Real | (done) |
| 7 | **Review → momentum loop** | Organizer | Add `review_state` to each participant; a `needs_another_pass` PR untouched 3+ days becomes a stall the agent sees | Wiring only | 25m |
| 8 | **Mentor inbox** | Mentor | **Reuses #6**: filter momentum actions by mentor, plus escalations from #2 | Wiring only | 25m |
| 9 | **Community safety watch** | Organizer | **Reuses #4**: run the tone classifier over `data/threads.json`, list hostile/condescending items with evidence | Wiring only | 25m |
| 10 | **Outcome metrics** | Organizer | Plain TypeScript over `cohort.json` (no Claude): retention, time to first review, time to merge, % reaching 2nd PR | Display | 30m |
| 11 | **Backtest** | Organizer | Compare momentum's flags with hidden `_outcome_dropped_on_day`: caught X of Y, Z days early | Display | 25m |

**Shared rules for every Claude feature:** structured output with Zod (`betaZodOutputFormat`), mock JSON in `data/mock-*.json` so the UI works offline, `claude-opus-5-5` with `fallbacks: "default"`.

## Screens

**Maya's journey** (a stepper across the top, one step per screen):
1. **Match**: her profile (skills, 6 hrs/week) → 3 issues ranked with "why this fits you" and a time estimate. She picks one.
2. **Ask**: she asks "what does `collate_fn` do and where do I change it?" Claude answers from the repo. A second question gets escalated to her mentor with a brief.
3. **Review**: her PR gets coached (strengths, guiding questions, understanding check). The maintainer sees a 3-line triage.
4. **Shield**: a real-world-style harsh comment arrives ("This is wrong. Did you even read the docs?"). She sees the shielded version with clear next steps; the organizer gets a flag.
5. **Proof**: merged. She gets 3 resume bullets, and her draft "I just fixed a small bug" is flagged as underselling and rewritten with the facts.

**Program view** (tabs): Cohort (momentum agent) · Mentor inbox · Safety watch · Metrics + backtest.

## Demo-day build order

Build the journey in order, so if time runs out you cut from the end, not the middle.

| Time | Build | Cut line |
|---|---|---|
| 9:00–9:30 | Key in, live test of review + momentum, push | |
| 9:30–10:15 | #4 Tone shield (the most memorable women-specific feature) | |
| 10:15–10:50 | #5 Proof profile | |
| 10:50–11:30 | #1 Issue matchmaker | |
| 11:30–12:15 | #2 Ask-anything + escalation | ← must-have line: journey steps 1–5 work |
| 12:15–12:35 | Lunch at keyboard | |
| 12:35–1:00 | #7 Review → momentum loop, #8 Mentor inbox | |
| 1:00–1:20 | #9 Safety watch (reuse tone shield) | |
| 1:20–1:45 | #10 Metrics + #11 Backtest | ← nice-to-have line |
| 1:45 | **Feature freeze** | |
| 1:45–2:30 | Journey stepper polish, record video | |
| 2:30–3:00 | Push, make the repo public, submit | |

**Honest scope check:** this is a lot for one person in 6 hours. It works only because #8, #9 and #11 reuse earlier engines and each Claude feature is one structured call. **If you find teammates at 9am** (teams up to 4 are allowed), split by lane: (A) journey steps 1–2, (B) steps 4–5, (C) program view 7–11, (D) UI polish + video + pitch.

## Demo video (2:30)

1. **0:00** "I ran GirlScript Summer of Code. This is Maya, and this is where women like her usually drop out." (problem in 20s)
2. **0:20** Match → Ask → Review (fast, 40s)
3. **1:00** **Shield**: the harsh comment and its shielded version. Pause here; this is the moment people remember. (25s)
4. **1:25** Proof profile: "I just fixed a small bug" → the real bullet. (15s)
5. **1:40** Organizer view: "Maya wasn't lazy, her mentor hadn't replied in 9 days," then the mentor inbox, safety flag, and backtest number. (35s)
6. **2:15** "Programs measure sign-ups. Momentum measures women who ship." (15s)
