"use client";

// Self-driving, Claude-narrated demo. Open the app with ?demo, click Prepare, then Record.
// Prepare runs every live Claude call once and caches the real responses; the tour then
// replays them instantly while it clicks through the product and plays the narration.

import { useState } from "react";
import { prefetch, demoCache } from "./ui";
import { sampleErrorScreenshot, SAMPLE_CHECKIN, SHIELD_PRESETS, ASK_PRESETS } from "./Journey";
import type { Checkin } from "@/lib/checkin";
import type { MomentumEvent } from "@/lib/momentum";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const lower = (s: string | null | undefined) => (s ?? "").toLowerCase();

function findButton(text: string) {
  return [...document.querySelectorAll("button")].find((b) => lower(b.textContent).includes(lower(text)) && b.offsetParent !== null) as HTMLButtonElement | undefined;
}
function scrollToEl(el: Element | null | undefined, offset = 96) {
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
}
function findText(text: string) {
  return [...document.querySelectorAll("h1,h2,h3,p,span,blockquote")].find((e) => lower(e.textContent).includes(lower(text)) && (e as HTMLElement).offsetParent !== null);
}
async function waitFor(text: string, timeout = 12000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const el = findText(text);
    if (el) return el;
    await sleep(150);
  }
  return null;
}
async function click(text: string, scroll = true) {
  for (let i = 0; i < 60; i++) {
    const b = findButton(text);
    if (b && !b.disabled) {
      if (scroll) {
        scrollToEl(b, 260);
        await sleep(500);
      }
      b.click();
      return true;
    }
    await sleep(150);
  }
  return false;
}
async function goStep(i: number) {
  (document.querySelector(`[data-step="${i}"]`) as HTMLButtonElement | null)?.click();
  await sleep(450);
  scrollToEl(document.querySelector("[data-step]")?.closest("ol"), 90);
  await sleep(700);
}
async function view(name: "journey" | "program") {
  await click(name === "journey" ? "Maya's journey" : "Program view", false);
  await sleep(300);
  window.scrollTo({ top: 0, behavior: "smooth" });
  await sleep(600);
}

type Card = { kicker: string; title: string; lines: string[] } | null;
type Later = { at: number; card?: Card; caption?: string };
type Seg = { id: string; caption: string; card?: Card; later?: Later[]; act?: () => Promise<void> };

const INTRO: Card = {
  kicker: "Code with Claude · Women in AI Hackathon 2026",
  title: "Momentum",
  lines: ["Mess around. Find out. Stay.", "An AI co-pilot for women in open-source mentorship programs"],
};
const NUMBERS: Card = {
  kicker: "GirlScript Summer of Code 2024 · Shatakshi was 1 of 4 program managers",
  title: "27,000 registered. 17,000 showed up.",
  lines: ["At least 6,000 never opened a single pull request.", "Setup, feeling allowed to ask, and one harsh review stopped them. Not the code."],
};
const SAFETY_NET: Card = {
  kicker: "Who leaves first",
  title: "The women without a safety net.",
  lines: ["Working while they study · no one in tech to ask · learning on a phone on a train", "4 program managers can't fix that one person at a time. It needed a system."],
};
const OUTRO: Card = {
  kicker: "Built with Claude Opus 5.5 · Claude Code · Next.js",
  title: "Momentum",
  lines: [
    "Structured outputs · tool-using agent with a live trail · vision · voice",
    "No real participant data · human approves every message · technical feedback never hidden",
    "github.com/Shatakshi107/momentum",
  ],
};

const SEGMENTS: Seg[] = [
  { id: "01", caption: "Everyone here learned AI the same way: you messed around and found out.", card: INTRO },
  {
    id: "02",
    caption: "Shatakshi saw it at GSSoC 2024: at least 6,000 people never opened a single PR.",
    card: NUMBERS,
    later: [{ at: 19000, card: SAFETY_NET, caption: "The women who left first had no safety net. It needed a system." }],
  },
  {
    id: "03",
    caption: "Meet Maya: community college in Oakland, 20 hrs/week at a café, 6 hrs for open source.",
    act: async () => {
      await view("journey");
      await sleep(2500);
      scrollToEl(findText("Maya R."), 140);
    },
  },
  {
    id: "04",
    caption: "Voice check-in on BART: Claude hears the blocker, the stress, and answers out loud.",
    act: async () => {
      await goStep(2);
      await click("Use sample check-in");
      await sleep(900);
      await click("Send check-in");
      scrollToEl(await waitFor("replied out loud"), 120);
    },
  },
  {
    id: "05",
    caption: "“Did you even read the docs?” She gets the technical point. Organizers get the flag.",
    act: async () => {
      await goStep(4);
      await click("Shield this comment");
      scrollToEl(await waitFor("What Maya sees"), 120);
      await sleep(4500);
      await click("Alert #organizers");
      await sleep(900);
      scrollToEl(await waitFor("Posted to"), 200);
    },
  },
  {
    id: "06",
    caption: "An issue that fits her week · screenshot help · a resume line with evidence.",
    act: async () => {
      await goStep(0);
      await click("Find Maya's first issue");
      scrollToEl(await waitFor("Best fit"), 140);
      await sleep(1200);
      await goStep(1);
      await click("Sample: terminal error screenshot");
      await click("Ask privately");
      await waitFor("Answered from repo docs");
      scrollToEl(findText("Answered from repo docs"), 220);
      await sleep(1200);
      await goStep(5);
      await click("Build Maya's proof profile");
      scrollToEl(await waitFor("Open-source contributor"), 200);
    },
  },
  {
    id: "07",
    caption: "The organizer's view: an agent with tools works out why each person went quiet.",
    act: async () => {
      await view("program");
      await sleep(2200);
      await click("Who needs us this week?");
      scrollToEl(await waitFor("Co-pilot at work"), 140);
    },
  },
  {
    id: "08",
    caption: "“Our fault, not hers.” A human approves every message before it goes out.",
    act: async () => {
      scrollToEl(await waitFor("This week's briefing", 45000), 110);
      await sleep(6500);
      const card = document.querySelector(".grid .rise");
      scrollToEl(card, 140);
      await sleep(3000);
      await click("Approve & send");
      await sleep(1000);
      scrollToEl(await waitFor("Posted to"), 300);
    },
  },
  {
    id: "09",
    caption: "Eval: we hid who drops out, then scored the agent's early flags.",
    act: async () => {
      await click("Impact", false);
      await sleep(600);
      scrollToEl(await waitFor("future dropouts caught"), 160);
      await sleep(3500);
      scrollToEl(findText("Timeline:"), 140);
    },
  },
  { id: "10", caption: "From Oakland to the Mission: every builder gets to find out what she's capable of.", card: OUTRO },
];

// Timing log, read by the headless recorder to lay the narration onto the video.
type TourWindow = Window & { __tourLog?: { id: string; t: number }[]; __tourDone?: number; __tourPlayStart?: number };

// Chrome plays the AAC clips; open-source Chromium (the headless recorder) needs WAV.
const AUDIO_EXT = () => (typeof Audio !== "undefined" && new Audio().canPlayType("audio/mp4") ? "m4a" : "wav");

// Always hold for the clip's real length (from script.json), even if the browser can't play it.
function playAudio(src: string, minSeconds = 0) {
  const minHold = new Promise<void>((r) => setTimeout(r, minSeconds * 1000));
  const playback = new Promise<void>((resolve) => {
    const a = new Audio(src);
    a.onended = () => resolve();
    const waitOut = () => {
      // If playback is blocked (e.g. headless recording), still hold for the clip's length.
      const hold = () => setTimeout(resolve, (isFinite(a.duration) ? a.duration : 12) * 1000);
      if (a.readyState >= 1) hold();
      else a.onloadedmetadata = hold;
    };
    a.onerror = () => resolve();
    a.play().catch(waitOut);
  });
  const cap = new Promise<void>((r) => setTimeout(r, (minSeconds + 3) * 1000)); // never hang on a stalled clip
  return Promise.all([minHold, Promise.race([playback, cap])]).then(() => undefined);
}

async function startRecorder() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 30 },
    audio: true,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
  } as DisplayMediaStreamOptions);
  const mime = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start(1000);
  return () =>
    new Promise<void>((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: mime || "video/webm" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `momentum-demo.${mime.includes("mp4") ? "mp4" : "webm"}`;
        a.click();
        stream.getTracks().forEach((t) => t.stop());
        resolve();
      };
      rec.stop();
    });
}

export default function Tour() {
  const [phase, setPhase] = useState<"idle" | "preparing" | "ready" | "playing" | "done">("idle");
  const [progress, setProgress] = useState("");
  const [caption, setCaption] = useState("");
  const [card, setCard] = useState<Card>(null);

  async function prepare() {
    setPhase("preparing");
    let n = 0;
    const tick = (label: string) => setProgress(`${++n}/8 · ${label}`);
    const tone = SHIELD_PRESETS[0].text;
    const [checkin] = await Promise.all([
      prefetch<Checkin>("/api/ai/checkin", { transcript: SAMPLE_CHECKIN }).finally(() => tick("voice check-in")),
      prefetch("/api/ai/tone", { text: tone, context: "Review comment on Maya's first PR (#547, fixing issue #512)" }).finally(() => tick("tone shield")),
      prefetch("/api/ai/match", {}).finally(() => tick("matchmaker")),
      prefetch("/api/ai/ask", { question: "I ran the tests and got this. What did I do wrong?", image: { data: sampleErrorScreenshot(), media_type: "image/png" } }).finally(() => tick("screenshot help")),
      prefetch("/api/ai/ask", { question: ASK_PRESETS[0] }).finally(() => tick("ask")),
      prefetch("/api/ai/proof", {}).finally(() => tick("proof profile")),
      prefetch("/api/review", { prUrl: "demo" }).finally(() => tick("review coach")),
    ]);
    // The agent run includes Maya's check-in as fresh evidence, exactly as in the live flow.
    const res = await fetch("/api/momentum", {
      method: "POST",
      body: JSON.stringify({ signals: [`Maya R. (p09) voice check-in: ${checkin.organizer_signal}`] }),
    });
    const text = await res.text();
    demoCache.set("momentum-events", text.split("\n").filter(Boolean).map((l) => JSON.parse(l) as MomentumEvent));
    tick("co-pilot agent");
    setPhase("ready");
  }

  async function play(record: boolean) {
    let stop: (() => Promise<void>) | null = null;
    if (record) {
      try {
        stop = await startRecorder();
      } catch {
        return; // user cancelled the share dialog
      }
    }
    setPhase("playing");
    const w = window as TourWindow;
    const durations: Record<string, number> = Object.fromEntries(
      ((await fetch("/narration/script.json").then((r) => r.json())) as { id: string; dur: number }[]).map((x) => [x.id, x.dur]),
    );
    w.__tourLog = [];
    w.__tourDone = undefined;
    w.__tourPlayStart = Date.now();
    window.scrollTo({ top: 0 });
    await sleep(300);
    for (const seg of SEGMENTS) {
      setCaption(seg.caption);
      setCard(seg.card ?? null);
      const timers = (seg.later ?? []).map((l) =>
        setTimeout(() => {
          if (l.card) setCard(l.card);
          if (l.caption) setCaption(l.caption);
        }, l.at),
      );
      w.__tourLog.push({ id: seg.id, t: Date.now() });
      await Promise.all([playAudio(`/narration/${seg.id}.${AUDIO_EXT()}`, durations[seg.id] ?? 0), seg.act?.() ?? Promise.resolve()]);
      timers.forEach(clearTimeout);
      await sleep(250);
    }
    await sleep(900);
    setCard(null);
    setCaption("");
    w.__tourDone = Date.now();
    if (stop) await stop();
    setPhase("done");
  }

  return (
    <>
      {card && (
        <div className="rise fixed inset-0 z-50 flex items-center justify-center bg-ink px-6 text-bg">
          <div className="max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-60">{card.kicker}</p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-tight sm:text-7xl">{card.title}</h1>
            {card.lines.map((l, i) => (
              <p key={l} className={`mt-5 ${i === 0 ? "font-display text-2xl italic sm:text-3xl" : "text-lg opacity-75"}`}>
                {l}
              </p>
            ))}
          </div>
        </div>
      )}
      {phase === "playing" && caption && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
          <p className="max-w-3xl rounded-2xl bg-black/80 px-5 py-3 text-center text-[15px] font-medium leading-snug text-white shadow-card backdrop-blur">{caption}</p>
        </div>
      )}
      {phase !== "playing" && (
        <div className="fixed bottom-4 left-4 z-40 w-72 rounded-2xl border border-line bg-surface p-4 text-sm shadow-card">
          <p className="font-semibold">🎬 Claude-narrated demo</p>
          <p className="mt-1 text-xs text-muted">
            {phase === "idle" && "Step 1 runs every live Claude call once (~1 min). Then play or record."}
            {phase === "preparing" && `Running live calls… ${progress}`}
            {phase === "ready" && "Ready. Record shares this tab (keep “Also share tab audio” on) and saves a video to Downloads."}
            {phase === "done" && "Done! Check your Downloads for momentum-demo."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(phase === "idle" || phase === "preparing") && (
              <button onClick={prepare} disabled={phase === "preparing"} className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-brand-ink disabled:opacity-60">
                {phase === "preparing" ? "Preparing…" : "1 · Prepare"}
              </button>
            )}
            {(phase === "ready" || phase === "done") && (
              <>
                <button onClick={() => play(false)} className="rounded-full border border-line px-3 py-1.5 text-xs font-medium">▶ Preview</button>
                <button onClick={() => play(true)} className="rounded-full bg-coral px-3 py-1.5 text-xs font-medium text-white">● Record</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
