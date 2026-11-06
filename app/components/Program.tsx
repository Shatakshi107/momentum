"use client";

import { useState } from "react";
import threads from "@/data/threads.json";
import type { Action } from "@/lib/momentum";
import type { Safety } from "@/lib/tone";
import { cohortMetrics, backtest, participantsById, mentors } from "@/lib/metrics";
import { useApi, Button, Card, Pill, MockBadge, ErrorText, label } from "./ui";

type MomentumResult = { summary: string; actions: Action[]; mock: boolean };
const TABS = ["Cohort", "Mentor inbox", "Safety watch", "Metrics"] as const;
const urgencyTone = { today: "red", this_week: "amber", watch: "neutral" } as const;

export default function Program({ escalations }: { escalations: string[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Cohort");
  const momentum = useApi<MomentumResult>("/api/momentum");
  const runMomentum = () => momentum.run({ question: "Who is at risk of dropping off this week, and what should I do?" });

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"}`}
          >
            {t}
            {t === "Mentor inbox" && escalations.length > 0 && <span className="ml-1.5 rounded-full bg-violet-600 px-1.5 text-xs text-white">{escalations.length}</span>}
          </button>
        ))}
      </nav>
      {tab === "Cohort" && <Cohort api={momentum} run={runMomentum} />}
      {tab === "Mentor inbox" && <MentorInbox data={momentum.data} run={runMomentum} loading={momentum.loading} escalations={escalations} />}
      {tab === "Safety watch" && <SafetyWatch />}
      {tab === "Metrics" && <Metrics actions={momentum.data?.actions} run={runMomentum} loading={momentum.loading} />}
    </div>
  );
}

function ActionCard({ a }: { a: Action }) {
  const p = participantsById[a.participant_id];
  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{p?.name ?? a.participant_id}</span>
        <span className="text-xs text-neutral-500">{p?.location} · mentor {p?.mentor}</span>
        <span className="ml-auto"><Pill tone={urgencyTone[a.urgency]}>{label(a.urgency)}</Pill></span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <Pill tone="violet">{label(a.diagnosis)}</Pill>
        <span className="text-neutral-500">→ {label(a.action)}</span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{a.evidence}</p>
      <blockquote className="border-l-2 border-violet-300 pl-3 text-sm italic">{a.message_draft}</blockquote>
    </Card>
  );
}

function Cohort({ api, run }: { api: ReturnType<typeof useApi<MomentumResult>>; run: () => void }) {
  const d = api.data;
  return (
    <section>
      <p className="mb-4 text-sm text-neutral-500">Quiet is a symptom. The co-pilot investigates every participant, finds the cause, and proposes the fix, including when the cause is us.</p>
      <Button onClick={run} loading={api.loading} label="Investigating the cohort…">Who needs us this week?</Button>
      <ErrorText error={api.error} />
      {d && (
        <div className="mt-5 space-y-3">
          <Card className="bg-violet-50 dark:bg-violet-950/40">
            <p className="text-sm leading-relaxed">{d.summary} <MockBadge on={d.mock} /></p>
          </Card>
          {d.actions.map((a) => <ActionCard key={a.participant_id} a={a} />)}
        </div>
      )}
    </section>
  );
}

function MentorInbox({ data, run, loading, escalations }: { data: MomentumResult | null; run: () => void; loading: boolean; escalations: string[] }) {
  return (
    <section className="space-y-6">
      <p className="text-sm text-neutral-500">Each mentor sees who needs them today, why, and a drafted message. Nobody gets ghosted because their mentor had 30 mentees.</p>
      {!data && <Button onClick={run} loading={loading} label="Building inboxes…">Build today&apos;s inboxes</Button>}
      {mentors.map((m) => {
        const items = (data?.actions ?? []).filter((a) => participantsById[a.participant_id]?.mentor === m.name);
        const asks = m.name === "Meera" ? escalations : [];
        if (data == null && asks.length === 0) return null;
        return (
          <div key={m.name}>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-semibold">{m.name}</h3>
              <span className="text-xs text-neutral-500">{m.mentees} mentees</span>
              {m.days_since_last_reply > 5 && <Pill tone="red">last replied {m.days_since_last_reply} days ago</Pill>}
            </div>
            <div className="space-y-3">
              {asks.map((brief, i) => (
                <Card key={i} className="border-amber-300 dark:border-amber-800">
                  <div className="mb-1"><Pill tone="amber">question escalated from Ritika</Pill></div>
                  <pre className="whitespace-pre-wrap text-sm">{brief}</pre>
                </Card>
              ))}
              {items.map((a) => <ActionCard key={a.participant_id} a={a} />)}
              {data && items.length === 0 && asks.length === 0 && <p className="text-sm text-neutral-500">All mentees on track.</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

const categoryTone = { constructive: "green", blunt: "neutral", condescending: "amber", hostile: "red", harassment: "red" } as const;

function SafetyWatch() {
  const api = useApi<Safety & { mock: boolean }>("/api/ai/safety");
  const d = api.data;
  const byId = Object.fromEntries((d?.items ?? []).map((i) => [i.id, i]));
  return (
    <section>
      <p className="mb-4 text-sm text-neutral-500">The same classifier as the tone shield, run across every PR thread and channel, so organizers see patterns, not just incidents.</p>
      <Button onClick={() => api.run()} loading={api.loading} label="Scanning…">Scan program channels</Button>
      <ErrorText error={api.error} />
      {d && (
        <div className="mt-5 space-y-3">
          <Card className="bg-violet-50 dark:bg-violet-950/40"><p className="text-sm">{d.summary} <MockBadge on={d.mock} /></p></Card>
          {threads.map((t) => {
            const r = byId[t.id];
            return (
              <Card key={t.id} className={r?.flag_organizer ? "border-red-300 dark:border-red-900" : "opacity-70"}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-neutral-500">{t.where} · {t.author}</span>
                  {r && <Pill tone={categoryTone[r.category]}>{r.category}</Pill>}
                  {r?.bias && <Pill tone="red">identity-based</Pill>}
                </div>
                <p className="mt-2 text-sm">&ldquo;{t.text}&rdquo;</p>
                {r?.flag_organizer && <p className="mt-2 text-xs text-red-700 dark:text-red-400">⚑ {r.flag_reason}{r.bias_note ? ` (${r.bias_note})` : ""}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Stat({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <Card>
      <div className="text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-sm">{label}</div>
      {sub && <div className="text-xs text-neutral-500">{sub}</div>}
    </Card>
  );
}

function Metrics({ actions, run, loading }: { actions?: Action[]; run: () => void; loading: boolean }) {
  const m = cohortMetrics();
  const bt = actions ? backtest(actions) : null;
  const pct = (x: number) => `${Math.round((x / m.participants) * 100)}%`;
  return (
    <section className="space-y-6">
      <div>
        <h3 className="mb-1 font-semibold">Outcomes, not sign-ups</h3>
        <p className="mb-3 text-xs text-neutral-500">Synthetic demo cohort, day 21 of the program.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat value={pct(m.first_merge)} label="Reached a first merged PR" sub={`${m.first_merge} of ${m.participants}`} />
          <Stat value={pct(m.second_pr_opened)} label="Came back for a 2nd PR" sub={`${m.second_merge} already merged a 2nd`} />
          <Stat value={`${m.median_days_to_first_review}d`} label="Median wait for first review" />
          <Stat value={m.prs_waiting_on_maintainer_over_7_days} label="PRs waiting on us 7+ days" sub="the program's fault, not hers" />
        </div>
      </div>
      <div>
        <h3 className="mb-1 font-semibold">Backtest: would the co-pilot have caught them?</h3>
        <p className="mb-3 text-xs text-neutral-500">Compares this week&apos;s flags with who actually dropped out later (hidden from the agent).</p>
        {!bt ? (
          <Button onClick={run} loading={loading} label="Running co-pilot…">Run the co-pilot and score it</Button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat value={`${bt.caught.length} of ${bt.would_drop}`} label="Future dropouts caught" />
              <Stat value={`${bt.avg_days_early} days`} label="Average warning before they'd leave" />
              <Stat value={bt.false_alarms.length} label="False alarms" />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Caught: {bt.caught.join(", ") || "none"}. Missed: {bt.missed.join(", ") || "none"}.
              {bt.already_lost.length > 0 && ` Already lost before day 21: ${bt.already_lost.join(", ")}, which is why it has to run every week.`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
