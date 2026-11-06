"use client";

import { useState } from "react";
import type { Review } from "@/lib/review";
import type { Action } from "@/lib/momentum";

type Tab = "cohort" | "review";

export default function Home() {
  const [tab, setTab] = useState<Tab>("cohort");
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Momentum</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Keeps every participant in your open-source program moving, and coaches every PR before a maintainer sees it.
        </p>
      </header>
      <nav className="mb-6 flex gap-2">
        {(
          [
            ["cohort", "Cohort momentum"],
            ["review", "PR review coach"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === id ? "bg-violet-600 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "cohort" ? <CohortPanel /> : <ReviewPanel />}
    </main>
  );
}

function MockBadge({ on }: { on: boolean }) {
  if (!on) return null;
  return <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">mock data</span>;
}

const urgencyStyle: Record<Action["urgency"], string> = {
  today: "border-l-red-500",
  this_week: "border-l-amber-500",
  watch: "border-l-neutral-400",
};

function CohortPanel() {
  const [question, setQuestion] = useState("Who is at risk of dropping off this week, and what should I do?");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ summary: string; actions: Action[]; mock: boolean } | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/momentum", { method: "POST", body: JSON.stringify({ question }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <button onClick={run} disabled={loading} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Investigating…" : "Ask the co-pilot"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {data && (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg bg-violet-50 p-4 text-sm leading-relaxed text-violet-950 dark:bg-violet-950/40 dark:text-violet-100">
            {data.summary}
            <MockBadge on={data.mock} />
          </p>
          {data.actions.map((a) => (
            <article key={a.participant_id} className={`rounded-lg border border-l-4 border-neutral-200 p-4 dark:border-neutral-800 ${urgencyStyle[a.urgency]}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-neutral-500">{a.participant_id}</span>
                <span className="rounded bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">{a.diagnosis.replaceAll("_", " ")}</span>
                <span className="text-neutral-500">→ {a.action.replaceAll("_", " ")}</span>
                <span className="ml-auto font-medium uppercase text-neutral-500">{a.urgency.replace("_", " ")}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{a.evidence}</p>
              <blockquote className="mt-3 border-l-2 border-violet-300 pl-3 text-sm italic">{a.message_draft}</blockquote>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const severityStyle = {
  blocker: "bg-red-100 text-red-800",
  should_fix: "bg-amber-100 text-amber-800",
  nit: "bg-neutral-100 text-neutral-700",
};

function ReviewPanel() {
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ review: Review; mock: boolean; title: string } | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/review", { method: "POST", body: JSON.stringify({ prUrl }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const r = data?.review;
  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/123"
          className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <button onClick={run} disabled={loading} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Reviewing…" : "Coach this PR"}
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {r && data && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <h2 className="font-medium">
              For the contributor <MockBadge on={data.mock} />
            </h2>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-300">
              {r.strengths.map((s) => (
                <li key={s}>✓ {s}</li>
              ))}
            </ul>
            {r.coaching.map((c, i) => (
              <article key={i} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded px-2 py-0.5 font-medium ${severityStyle[c.severity]}`}>{c.severity.replace("_", " ")}</span>
                  <span className="font-mono text-neutral-500">
                    {c.file} · {c.line_hint}
                  </span>
                </div>
                <p className="mt-2 text-sm">{c.what}</p>
                <p className="mt-1 text-sm text-neutral-500">{c.why}</p>
                <p className="mt-2 text-sm font-medium text-violet-700 dark:text-violet-300">💭 {c.question}</p>
              </article>
            ))}
            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
              <h3 className="text-sm font-medium">Before a human reviews: can you answer these?</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {r.understanding_check.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </div>
          </div>
          <aside className="h-fit rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="text-sm font-medium">For the maintainer</h2>
            <p className="mt-2 inline-block rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">{r.readiness.replaceAll("_", " ")}</p>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{r.maintainer_summary}</p>
          </aside>
        </div>
      )}
    </section>
  );
}
