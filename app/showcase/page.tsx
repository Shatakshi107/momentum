"use client";

// A single, screenshot-ready "this is my app" page. Static by design: no API calls,
// so it always renders instantly and identically. Open /showcase.

import type { ReactNode } from "react";
import { Avatar, DiscordLogo } from "../components/ui";

function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center justify-center rounded-xl bg-brand text-brand-ink" style={{ width: size, height: size }} aria-hidden>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <path d="M2 12 L6 7 L9 10 L14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 3 H14 V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Tile({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-surface p-5 shadow-card ${className}`}>{children}</div>;
}

function Kicker({ children, tone = "text-brand" }: { children: ReactNode; tone?: string }) {
  return <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${tone}`}>{children}</p>;
}

const WAVE = [6, 14, 22, 12, 28, 18, 34, 20, 10, 26, 16, 30, 12, 22, 8, 18, 26, 14, 20, 10, 24, 12, 6];

export default function Showcase() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      {/* soft color fields */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, var(--brand-soft), transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[520px] w-[520px] rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(circle, var(--coral-soft), transparent 70%)" }} />

      <div className="relative mx-auto grid min-h-screen max-w-[1500px] items-center gap-12 px-6 py-12 lg:grid-cols-[1fr_1.15fr] lg:px-14">
        {/* ── Left: the pitch ── */}
        <section>
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-display text-2xl font-medium tracking-tight">Momentum</span>
            <span className="ml-1 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">Built with Claude</span>
          </div>

          <h1 className="mt-10 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
            From first issue
            <br />
            to <em className="text-brand">second PR</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            An AI co-pilot that keeps women in open-source mentorship programs moving. A safe place to ask, learn and ship, and an early heads-up for organizers before anyone quietly drops out.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              { v: "27,000", l: "registered for GSSoC 2024" },
              { v: "6,000+", l: "never opened a single PR" },
              { v: "6 / 6", l: "at-risk caught early*" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-line bg-surface/70 p-4 backdrop-blur">
                <p className="font-display text-3xl font-medium tabular-nums">{s.v}</p>
                <p className="mt-1 text-xs leading-snug text-muted">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex max-w-xl flex-wrap gap-2">
            {["🎙 Voice check-ins", "🛡 Tone shield", "💭 Review coach", "📸 Screenshot help", "✦ Agentic co-pilot", "📈 Retention eval"].map((f) => (
              <span key={f} className="rounded-full bg-surface px-3 py-1.5 text-sm shadow-card">{f}</span>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-3 border-t border-line pt-6">
            <Avatar name="Shatakshi Chaudhari" size={40} />
            <div className="text-sm">
              <p className="font-medium">Shatakshi Chaudhari</p>
              <p className="text-muted">Code with Claude: Women in AI Hackathon · San Francisco 2026</p>
            </div>
            <p className="ml-auto hidden font-mono text-xs text-muted xl:block">github.com/Shatakshi107/momentum</p>
          </div>
          <p className="mt-3 text-[11px] text-muted">*Backtest on a simulated cohort. GSSoC figures are public program stats.</p>
        </section>

        {/* ── Right: product moments ── */}
        <section className="relative grid gap-4 sm:grid-cols-2">
          {/* Persona */}
          <div className="absolute -top-6 left-6 z-10 flex items-center gap-3 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-4 shadow-card">
            <Avatar name="Maya R." size={34} />
            <div className="text-xs leading-tight">
              <p className="font-semibold">Maya R. · Oakland</p>
              <p className="text-muted">Community college · 6 hrs/week on BART</p>
            </div>
          </div>

          {/* Voice check-in */}
          <Tile className="pt-9">
            <Kicker>Voice check-in</Kicker>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral text-lg text-white">🎙</span>
              <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden>
                {WAVE.map((h, i) => (
                  <span key={i} className="w-[4px] rounded-full bg-brand" style={{ height: h, opacity: 0.35 + (h / 34) * 0.65 }} />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm italic leading-relaxed text-muted">&ldquo;Stuck on tests for three days… kind of wondering if this is for me.&rdquo;</p>
            <div className="mt-3 rounded-2xl bg-brand-soft p-3 text-sm leading-relaxed">
              <span className="mr-1">🔊</span>Reproducing that crash is real progress. On BART tonight, just run the one failing test. Nicole will check in today.
            </div>
          </Tile>

          {/* Tone shield */}
          <Tile className="pt-9">
            <Kicker>Tone shield</Kicker>
            <p className="mt-4 select-none text-sm text-muted blur-[3px]">This is wrong. Did you even read the docs? drop_last exists for a reason.</p>
            <div className="my-3 flex items-center gap-2 text-xs text-muted">
              <span className="h-px flex-1 bg-line" /> what Maya sees <span className="h-px flex-1 bg-line" />
            </div>
            <p className="text-sm leading-relaxed">The built-in <code className="rounded bg-surface-2 px-1">drop_last</code> option may already cover this. Could you check the docs and see if it fits?</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {["Read the drop_last docs", "Swap in drop_last, or explain why not"].map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-3 inline-block rounded-full bg-coral-soft px-2.5 py-1 text-xs font-medium text-coral">⚑ flagged to organizers</p>
          </Tile>

          {/* Co-pilot briefing */}
          <div className="rounded-3xl bg-ink p-6 text-bg shadow-card sm:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Kicker tone="text-bg/60">Co-pilot · this week&apos;s briefing</Kicker>
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-bg/10 px-2.5 py-1 font-mono text-[11px] opacity-80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" /> 23 steps · 12 timelines read
              </span>
            </div>
            <p className="mt-4 font-display text-xl leading-relaxed sm:text-2xl">
              Maya&apos;s mentor hasn&apos;t replied to anyone in 9 days, so move her to Chris today. And escalate Jasmine&apos;s PR: 15 days waiting on <em>us</em>, not her.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { n: "Maya R.", d: "mentor unresponsive", a: "reassign mentor", u: "bg-coral" },
                { n: "Jasmine T.", d: "waiting on maintainer", a: "escalate review", u: "bg-coral" },
                { n: "Sofia M.", d: "overwhelmed by review", a: "break into steps", u: "bg-amber" },
              ].map((c) => (
                <div key={c.n} className="relative overflow-hidden rounded-2xl bg-bg/10 p-3 pl-4">
                  <span className={`absolute inset-y-0 left-0 w-1 ${c.u}`} />
                  <div className="flex items-center gap-2">
                    <Avatar name={c.n} size={24} />
                    <p className="text-sm font-medium">{c.n}</p>
                  </div>
                  <p className="mt-2 text-xs opacity-70">{c.d}</p>
                  <p className="text-xs font-medium">→ {c.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discord post */}
          <div className="rounded-3xl p-4 shadow-card" style={{ background: "#313338", color: "#dbdee1" }}>
            <p className="mb-2 flex items-center gap-1.5 text-xs" style={{ color: "#949ba4" }}>
              <DiscordLogo size={13} color="#949ba4" /> # pod-14
            </p>
            <div className="flex gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">M</span>
              <div className="min-w-0 text-[13px]">
                <p className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">Momentum</span>
                  <span className="rounded px-1 text-[10px] font-semibold text-white" style={{ background: "#5865F2" }}>APP</span>
                </p>
                <div className="mt-1 rounded border-l-4 p-2.5" style={{ background: "#2b2d31", borderColor: "#5b3fd6" }}>
                  <p className="font-semibold text-white">👋 Jasmine, a note from the pod 14 team</p>
                  <p className="mt-1 leading-snug">Your PR #398 is solid, and the wait is on us, not you. A maintainer will review it by Friday.</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-right text-[11px]" style={{ color: "#949ba4" }}>approved by a human ✓</p>
          </div>

          {/* Proof profile */}
          <Tile>
            <Kicker>Proof profile</Kicker>
            <p className="mt-3 text-sm">
              <span className="text-amber line-through">I just helped fix a small bug</span>
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed">→ Fixed a DataLoader crash affecting training on uneven datasets; added 4 edge-case tests</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["PyTorch", "pytest", "Code review"].map((s) => (
                <span key={s} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">{s}</span>
              ))}
            </div>
          </Tile>
        </section>
      </div>
    </main>
  );
}
