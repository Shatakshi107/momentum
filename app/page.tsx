"use client";

import { useState, useSyncExternalStore } from "react";
import Journey from "./components/Journey";
import Program from "./components/Program";
import Tour from "./components/Tour";

export default function Home() {
  const [mode, setMode] = useState<"journey" | "program">("journey");
  // Questions Maya escalates in the journey land in her mentor's inbox.
  const [escalations, setEscalations] = useState<string[]>([]);
  // Voice check-ins become fresh evidence for the momentum agent.
  const [signals, setSignals] = useState<string[]>([]);
  // Open with ?demo to get the Claude-narrated, self-driving demo controls.
  const demo = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).has("demo"),
    () => false,
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-brand-ink" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12 L6 7 L9 10 L14 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 3 H14 V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="font-display text-xl font-medium tracking-tight">Momentum</span>
          </div>
          <div className="ml-auto flex rounded-full border border-line bg-surface p-1 text-sm shadow-card">
            {(
              [
                ["journey", "Maya's journey", "Journey"],
                ["program", "Program view", "Program"],
              ] as const
            ).map(([id, text, short]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition sm:px-4 ${mode === id ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}
              >
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{text}</span>
                {id === "program" && escalations.length > 0 && mode !== "program" && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-10 max-w-3xl">
          <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
            {mode === "journey" ? (
              <>From first issue to <em className="text-brand">second PR</em>.</>
            ) : (
              <>See who&apos;s slipping <em className="text-brand">before</em> they&apos;re gone.</>
            )}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {mode === "journey"
              ? "Momentum keeps women in open-source mentorship programs moving. Follow Maya through the six moments where most first-timers quit."
              : "One co-pilot for organizers, mentors and maintainers: it finds why people stall, fixes the cause, and measures who stays."}
          </p>
        </section>

        {/* Both stay mounted so results survive switching views during the demo. */}
        <div hidden={mode !== "journey"}>
          <Journey
            onEscalate={(b) => setEscalations((e) => (e.includes(b) ? e : [...e, b]))}
            onCheckin={(sig) => setSignals((s) => [...s, sig])}
          />
        </div>
        <div hidden={mode !== "program"}>
          <Program escalations={escalations} signals={signals} />
        </div>
      </main>

      {demo && <Tour />}
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Built with Claude · Code with Claude: Women in AI Hackathon 2026 · Demo cohort is synthetic
      </footer>
    </div>
  );
}
