# Momentum: demo video script (max 3:00)

# Option A (easiest): the Claude-narrated, self-driving demo

The app can record its own demo. Claude narrates (macOS "Samantha" voice) and the tour clicks through the product with captions and title cards.

1. Run the app (`npm run dev`) and open **http://localhost:3000/?demo** in **Chrome**.
2. In the 🎬 panel (bottom-left), click **1 · Prepare**. It runs every live Claude call once (~1 minute) and caches the real responses, so the recording has no waiting.
3. Click **▶ Preview** to watch it once (~2:50, with sound).
4. Click **● Record**. In Chrome's share dialog, choose **this tab**, keep **"Also share tab audio"** on, and click **Share**. Don't touch the page until it finishes.
5. The video saves to **Downloads** as `momentum-demo.mp4` (or `.webm`).

Narration text: `public/narration/script.json`. Regenerate a clip with:
```bash
say -v Samantha -r 190 --file-format=m4af --data-format=aac -o public/narration/02.m4a -f my-text.txt
```

---

# Option B: record it yourself


Covers what the submission asks for: **the problem, why I chose it, constraints, what I built it with, and the workflow.**
Say the lines in quotes. Do the clicks in brackets. Keep the camera on the product, not slides, except the two title cards.

---

## 0:00 to 0:30 · The problem and why me

**[Title card: "Momentum: mess around, find out, and stay."]**

> "Everyone at this hackathon learned AI the same way. You messed around and found out: forked a repo, broke it, opened a PR, got it torn apart, tried again. Open source is the biggest FAFO sandbox there is.
>
> But the cost of messing around isn't equal. In 2024 I was one of four program managers for GirlScript Summer of Code. 27,000 people registered. 17,000 showed up. They opened 11,000 PRs, so at least 6,000 people never opened a single one.
>
> Writing the code was never what stopped them. Setting up the repo, feeling allowed to ask, and one harsh review were. Four of us couldn't fix that one person at a time. It needed a system."

## 0:30 to 0:45 · What it is

**[App, Maya's journey. Hover the persona card.]**

> "Momentum is an AI co-pilot for open-source mentorship programs. It makes it safe for her to mess around, and it makes sure the program finds out before she quits. Meet Maya: community college in Oakland, works 20 hours a week, studies on BART."

## 0:45 to 1:25 · Her side (pre-run each step before recording)

**[Step 3 · Check in. Tap the mic, or use the sample. Let the reply play out loud.]**

> "She checks in by voice on the train. Claude hears that she's stuck on tests, stressed, and wondering if this is for her. It answers out loud with one thing she can do on the ride, and tells the program."

**[Step 5 · Shield. Show the blurred original next to "What Maya sees." Click Alert #organizers to show the Discord post.]**

> "Then this lands on her first PR: 'Did you even read the docs?' She gets the real technical point as clear next steps. The attack never reaches her alone, and organizers get flagged on Discord."

**[Quick flash, 2 seconds each: Match fit rings → Ask with screenshot → Proof profile.]**

> "Along the way it picks issues that fit her real week, reads her error screenshots, coaches her PR without rewriting it, and turns 'I just fixed a small bug' into a resume line backed by evidence."

## 1:25 to 2:05 · The program's side: the agent

**[Program view. Point at the KPI strip. Click "Who needs us this week?" Let the trail stream; cut the wait if needed.]**

> "This is the organizer's view. The co-pilot is an agent with tools: it reads every participant's timeline, mentor reply times and open PRs, and works out *why* each person went quiet.
>
> Look what it found. Jasmine's PR has waited 15 days on a maintainer. That's our fault, not hers. And Maya's mentor hasn't replied to anyone in 9 days, so it moved Maya to a new mentor, because the check-in's plan wouldn't have happened."

**[Click "Why?" on one card, then Approve & send. The Discord preview appears.]**

> "Every message is drafted, but a human approves it before it goes out."

## 2:05 to 2:25 · Proof it works (the eval)

**[Impact tab: the timeline.]**

> "We hid who actually drops out from the agent and scored it. On simulated data, it flagged the at-risk participants days before they would have left. That backtest is our eval. Next, it runs on real program history."

## 2:25 to 2:45 · How it's built, the constraints, and the close

**[Title card: a simple architecture slide, or the README "What's built" table.]**

> "It's built on Claude Opus 5.5 via the Claude API. It uses structured outputs for every feature, a tool-using agent that streams its reasoning live, vision for screenshots, and the browser's speech APIs for voice. Next.js, TypeScript, live GitHub data, built in a day with Claude Code.
>
> Constraints: no real participant data, so the cohort is synthetic. A human approves every message. Technical feedback is never hidden. And every call costs cents.
>
> The next generation of applied AI engineers is messing around in open source right now. Momentum makes sure all of them get to find out what they're capable of."

---

## If the video can be longer (or for Q&A): talking points by required section

**Problem.** First-time contributors, especially women, drop out between signing up and their first merged PR. The causes are specific and fixable: an issue too big for their time, fear of asking in public, harsh reviews, mentors who go quiet, PRs left waiting on maintainers. Programs only find out at the final report.

**Why I chose it.** I lived it as a GSSoC program manager (4 PMs : 17,000+ participants). Women's PRs are accepted less often when their gender is visible (Terrell et al., *PeerJ CS* 2017), and women tend to undersell their work (Exley & Kessler, *QJE* 2022). In 2026, AI-generated PR spam is making maintainers close the door on newcomers, so the first PR is getting harder, not easier.

**Constraints I designed around.**
- *Time:* a 6-hour build, solo. Each Claude feature is one structured call; only the diagnosis is an agent.
- *Privacy:* no real participant data. The demo cohort and national numbers are synthetic and labeled.
- *Safety and trust:* a human approves every outgoing message. The shield keeps every technical point and lets her reveal the original. Questions that need a human decision (API changes, policy) are escalated, never guessed.
- *Her real life:* 6 hours a week, a job, midterms, a phone on BART. Hence voice check-ins, time-aware matching and one-step-at-a-time guidance.
- *Latency and cost:* calls take 6 to 45 seconds and cost cents. The agent streams its trail, so nobody stares at a spinner. A mock mode runs offline.
- *Honesty:* the backtest runs on simulated data, so it's a proof of method. Discord is a visual mock for the demo.

**What I used.**
- **Claude Opus 5.5** (Claude API, `@anthropic-ai/sdk`): structured outputs with Zod, the Tool Runner for the agent (4 tools), vision for screenshots, server-side refusal fallback.
- **Next.js 16, TypeScript, Tailwind v4**; GitHub REST API for live good-first-issues; Web Speech API for voice in and out.
- **Built with Claude Code**, from research and feature spec to code, live testing and UI.

**Workflow (how the pieces connect).**
```
Participant side                         Program side
───────────────                          ────────────
Match → Ask (+screenshot) → Check in ─┐
      → Review coach → Shield → Proof │  signals: check-ins, review readiness,
                                      ├─▶ timelines, mentor reply times
                     escalations ─────┘          │
                                                 ▼
                                   Momentum agent (tools: list, read, mentors, propose)
                                                 │  streams its trail live
                                                 ▼
                          Draft actions → human approves → Discord (#pod / #organizers)
                                                 │
                                                 ▼
                          Impact: backtest against hidden outcomes (the eval)
```

---

## Recording checklist

- [ ] **Chrome**, window around 1280 px wide, light mode, browser zoom at 100%. Close other tabs and turn off notifications.
- [ ] `.env.local` has the API key and no `MOCK=1`. Restart `npm run dev`.
- [ ] **Pre-run the slow steps** in one session and don't reload: Check in (~6s), Shield (~10s), Review (~30s), Program co-pilot (~40s), Safety scan (~12s). Results stay on screen when you switch views.
- [ ] Allow mic permission once before recording, or use **"Use sample check-in"** (the voice reply still plays). Turn up system volume so the spoken reply is recorded.
- [ ] Record with QuickTime (File → New Screen Recording) or ⌘⇧5, with the mic on. Do one take per section, then trim.
- [ ] Backup plan if Wi-Fi fails: set `MOCK=1` in `.env.local` and restart. Everything runs on cached data, labeled "cached demo data."
- [ ] **Before submitting:** make the repo public:
  ```bash
  gh repo edit Shatakshi107/momentum --visibility public --accept-visibility-change-consequences
  ```
- [ ] Submit the video file and the repo link through the event form before **3:00 pm**.
- [ ] After the event, delete the API key in the Claude Console (it was pasted in chat).
