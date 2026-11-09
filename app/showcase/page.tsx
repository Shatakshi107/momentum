"use client";

// Screenshot-ready "this is my app" page. Static by design (no API calls). Open /showcase.

import type { ReactNode } from "react";
import { Avatar } from "../components/ui";

function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center justify-center rounded-xl bg-brand text-brand-ink" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <path d="M2 12 L6 7 L9 10 L14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 3 H14 V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// Simple line icons (crisper than emoji at screenshot size).
const ICON_PATHS: Record<string, ReactNode> = {
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4V5z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16z" />,
};
function Icon({ name, size = 20 }: { name: keyof typeof ICON_PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICON_PATHS[name]}
    </svg>
  );
}

const FEATURES = [
  { icon: "mic", name: "Voice check-ins", line: "Thirty seconds, out loud, on the train." },
  { icon: "shield", name: "Tone shield", line: "The feedback, without the attack." },
  { icon: "chat", name: "Review coach", line: "Questions that teach, not rewrites." },
  { icon: "spark", name: "AI co-pilot", line: "Finds why people stall, before they leave." },
] as const;

function Float({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`absolute z-20 rounded-2xl border border-line bg-surface p-4 shadow-[0_24px_60px_-20px_rgb(29_24_48/0.35)] ${className}`}>{children}</div>;
}

const WAVE = [8, 16, 24, 12, 30, 18, 34, 22, 10, 26, 16, 30, 12, 22, 8, 18];

export default function Showcase() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -right-48 top-1/2 h-[900px] w-[900px] -translate-y-1/2 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(circle, var(--brand-soft), transparent 65%)" }} />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-16 px-8 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-20">
        {/* ── Pitch ── */}
        <section>
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-display text-3xl font-medium tracking-tight">Momentum</span>
          </div>

          <h1 className="mt-14 font-display text-6xl font-medium leading-[1.02] tracking-tight xl:text-[5.5rem]">
            From first issue
            <br />
            to <em className="text-brand">second PR</em>.
          </h1>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-muted">The AI co-pilot for women in open-source mentorship programs.</p>

          <ul className="mt-12 grid max-w-lg gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.name} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon name={f.icon} /></span>
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-sm leading-snug text-muted">{f.line}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-14 text-sm text-muted">
            Built with <span className="font-medium text-ink">Claude</span>
          </p>
        </section>

        {/* ── Product ── */}
        <section className="relative mx-auto w-full max-w-[640px] py-24">
          {/* App window */}
          <div className="relative z-10 overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_40px_100px_-30px_rgb(29_24_48/0.45)]">
            <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-5 py-3">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
              ))}
              <span className="mx-auto rounded-md bg-surface px-10 py-1 font-mono text-[11px] text-muted">momentum.app</span>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-2xl bg-ink p-6 text-bg">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">Co-pilot · this week</p>
                <p className="mt-3 font-display text-[22px] leading-snug">
                  Maya&apos;s mentor has gone quiet. Pair her with a new one today, and nudge the maintainer on Jasmine&apos;s PR.
                </p>
              </div>
              {[
                { n: "Maya R.", d: "Mentor unresponsive", a: "Reassign mentor", bar: "bg-coral" },
                { n: "Jasmine T.", d: "Waiting on maintainer", a: "Escalate review", bar: "bg-coral" },
                { n: "Sofia M.", d: "Overwhelmed by review", a: "Break into steps", bar: "bg-amber" },
              ].map((r) => (
                <div key={r.n} className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line p-3.5 pl-5">
                  <span className={`absolute inset-y-0 left-0 w-1 ${r.bar}`} />
                  <Avatar name={r.n} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.n}</p>
                    <p className="text-xs text-muted">{r.d}</p>
                  </div>
                  <span className="ml-auto rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">{r.a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voice check-in */}
          <Float className="-left-24 -top-6 w-[280px]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white"><Icon name="mic" size={18} /></span>
              <div className="flex h-8 flex-1 items-center gap-[3px]" aria-hidden>
                {WAVE.map((h, i) => (
                  <span key={i} className="w-[3px] rounded-full bg-brand" style={{ height: h * 0.8, opacity: 0.4 + (h / 34) * 0.6 }} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Being stuck is normal. Run just the one failing test on BART tonight.
            </p>
          </Float>

          {/* Tone shield */}
          <Float className="-bottom-6 -left-28 w-[290px]">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand"><Icon name="shield" size={14} /> Tone shield</p>
            <p className="mt-2 select-none text-sm text-muted blur-[3px]">Did you even read the docs?</p>
            <p className="mt-2 text-sm leading-relaxed">The built-in <code className="rounded bg-surface-2 px-1">drop_last</code> option may already cover this. Worth a look?</p>
          </Float>

          {/* Review coach */}
          <Float className="-bottom-10 -right-12 w-[260px]">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand"><Icon name="chat" size={14} /> Review coach</p>
            <p className="mt-2.5 rounded-xl bg-brand-soft px-3 py-2.5 text-sm font-medium leading-snug text-brand">What did a drop_last=True user get before your change?</p>
          </Float>
        </section>
      </div>
    </main>
  );
}
