"use client";

import { useState } from "react";
import threads from "@/data/threads.json";
import cohort from "@/data/cohort.json";
import type { Action, MomentumEvent, MomentumResult, TrailStep } from "@/lib/momentum";
import type { Safety } from "@/lib/tone";
import { backtest, participantsById, mentors } from "@/lib/metrics";
import { useApi, Button, Card, Pill, MockBadge, ErrorText, label, Avatar, Thinking, StepHeader } from "./ui";

const TABS = ["Cohort", "Mentor inbox", "Safety watch", "Impact"] as const;
const urgencyTone = { today: "coral", this_week: "amber", watch: "neutral" } as const;
const urgencyBar = { today: "bg-coral", this_week: "bg-amber", watch: "bg-line" } as const;
const MOMENTUM_STEPS = [
  "scanning the 12 participants in pod 14…",
  "checking mentor reply times…",
  "reading timelines and open PRs…",
  "working out why each person went quiet…",
  "drafting the right next step for each…",
];

/** Reads the agent's NDJSON stream so steps and cards appear while it works. */
function useMomentum() {
  const [data, setData] = useState<MomentumResult | null>(null);
  const [live, setLive] = useState<{ trail: TrailStep[]; actions: Action[] }>({ trail: [], actions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function run(signals: string[]) {
    setLoading(true);
    setError("");
    setData(null);
    setLive({ trail: [], actions: [] });
    try {
      const res = await fetch("/api/momentum", { method: "POST", body: JSON.stringify({ signals }) });
      if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const e = JSON.parse(line) as MomentumEvent;
          if (e.type === "step") setLive((l) => ({ ...l, trail: [...l.trail, e.step] }));
          else if (e.type === "action") setLive((l) => ({ ...l, actions: [...l.actions, e.action] }));
          else if (e.type === "done") setData(e.result);
          else if (e.type === "error") setError(e.error);
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return { data, live, loading, error, run };
}
type MomentumApi = ReturnType<typeof useMomentum>;

export default function Program({ escalations, signals }: { escalations: string[]; signals: string[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Cohort");
  const momentum = useMomentum();
  const runMomentum = () => momentum.run(signals);

  return (
    <div>
      <KpiStrip />
      <nav className="mb-8 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${tab === t ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t}
            {t === "Mentor inbox" && escalations.length > 0 && <span className="rounded-full bg-brand px-1.5 text-xs text-brand-ink">{escalations.length}</span>}
          </button>
        ))}
      </nav>
      <div key={tab} className="rise">
        {tab === "Cohort" && <Cohort m={momentum} run={runMomentum} signals={signals} />}
        {tab === "Mentor inbox" && <MentorInbox data={momentum.data} run={runMomentum} loading={momentum.loading} escalations={escalations} />}
        {tab === "Safety watch" && <SafetyWatch />}
        {tab === "Impact" && <Impact actions={momentum.data?.actions} run={runMomentum} loading={momentum.loading} />}
      </div>
    </div>
  );
}

function KpiStrip() {
  // National program numbers (synthetic). The co-pilot demo below runs on one 12-person pod.
  const n = cohort.program_scale;
  const fmt = (x: number) => x.toLocaleString("en-US");
  const pct = (x: number) => `${Math.round((x / n.participants) * 100)}%`;
  const tiles = [
    { v: fmt(n.participants), l: "Participants", s: `${n.states} states · ${n.projects} projects · ${fmt(n.mentors)} mentors` },
    { v: pct(n.first_pr_merged), l: "First PR merged", s: `${fmt(n.first_pr_merged)} women shipped` },
    { v: pct(n.second_pr), l: "Came back for a 2nd PR", s: `${fmt(n.second_pr)} · the metric that matters` },
    { v: fmt(n.waiting_on_us_7d), l: "PRs waiting on us 7+ days", s: "our fault, not hers", warn: true },
  ];
  return (
    <div className="mb-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{cohort.program.replace(" (US, synthetic)", "")}</p>
        <p className="text-xs text-muted">
          <span className="font-medium text-coral">{fmt(n.at_risk_this_week)} at risk this week</span> · demo below: {cohort.pod}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.l} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <p className={`font-display text-3xl font-medium tabular-nums sm:text-4xl ${t.warn ? "text-coral" : ""}`}>{t.v}</p>
            <p className="mt-1 text-sm font-medium">{t.l}</p>
            <p className="truncate text-xs text-muted">{t.s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCard({ a, compact = false }: { a: Action; compact?: boolean }) {
  const p = participantsById[a.participant_id];
  const [sent, setSent] = useState(false);
  const [why, setWhy] = useState(!compact);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6 shadow-card">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${urgencyBar[a.urgency]}`} aria-hidden />
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={p?.name ?? a.participant_id} size={36} />
        <div className="min-w-0">
          <p className="font-medium">{p?.name ?? a.participant_id}</p>
          <p className="text-xs text-muted">{p?.location} · mentor {p?.mentor}</p>
        </div>
        <span className="ml-auto"><Pill tone={urgencyTone[a.urgency]}>{label(a.urgency)}</Pill></span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <Pill tone="brand">{label(a.diagnosis)}</Pill>
        <span className="text-muted">→</span>
        <span className="font-medium">{label(a.action)}</span>
        <button onClick={() => setWhy(!why)} className="ml-auto text-xs font-medium text-brand hover:underline">
          {why ? "Hide why" : "Why?"}
        </button>
      </div>
      {why && <p className="mt-2 text-sm leading-relaxed text-muted">{a.evidence}</p>}
      <div className="mt-4 rounded-xl bg-surface-2 p-4">
        <p className="mb-1 text-xs font-medium text-muted">Drafted message</p>
        <p className="text-sm leading-relaxed">{a.message_draft}</p>
        <div className="mt-3 flex justify-end">
          {sent ? (
            <span className="text-xs font-medium text-mint">✓ Sent to {p?.name.split(" ")[0]}</span>
          ) : (
            <Button size="sm" variant="soft" onClick={() => setSent(true)}>Approve &amp; send</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Trail({ steps, live = false }: { steps: TrailStep[]; live?: boolean }) {
  const [userOpen, setOpen] = useState(false);
  const open = live || userOpen;
  if (!steps?.length) return null;
  const reads = steps.filter((s) => s.tool === "get_participant").length;
  return (
    <div className="rounded-2xl border border-line bg-surface">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-3 text-left text-sm">
        <span>
          <span className="font-medium">{live ? "Co-pilot at work" : "How the co-pilot got here"}</span>
          <span className="text-muted"> · {steps.length} steps, {reads} timelines read</span>
          {live && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />}
        </span>
        <span className="text-muted">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <ol className="space-y-2 border-t border-line px-5 py-4">
          {steps.map((s, i) => (
            <li key={i} className="rise flex gap-3 text-sm">
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted">{i + 1}</span>
              <code className="shrink-0 rounded bg-surface-2 px-1.5 text-xs text-brand">{s.tool}</code>
              <span className="text-muted">{s.detail}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Cohort({ m, run, signals }: { m: MomentumApi; run: () => void; signals: string[] }) {
  const d = m.data;
  const actions = d?.actions ?? m.live.actions;
  return (
    <section>
      <StepHeader eyebrow="Co-pilot" title="Quiet is a symptom. Find the cause.">
        The co-pilot investigates every participant, works out why each one stalled, and drafts the fix. Sometimes the cause is us: a slow review or a mentor who stopped replying.
      </StepHeader>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} loading={m.loading}>{m.loading ? "Investigating…" : "Who needs us this week?"}</Button>
        {signals.length > 0 && <Pill tone="brand">🎙 {signals.length} new voice check-in{signals.length > 1 ? "s" : ""} included</Pill>}
      </div>
      <ErrorText error={m.error} />
      {(m.loading || d) && (
        <div className="rise mt-8 space-y-4">
          {d && (
            <div className="rise rounded-2xl bg-ink p-6 text-bg shadow-card">
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">This week&apos;s briefing</p>
                <MockBadge on={d.mock} />
              </div>
              <p className="whitespace-pre-line font-display text-lg leading-relaxed">{d.summary.replaceAll("**", "")}</p>
            </div>
          )}
          {m.loading && m.live.trail.length === 0 && <Thinking lines={1} steps={MOMENTUM_STEPS} />}
          <Trail steps={d?.trail ?? m.live.trail} live={m.loading} />
          <div className="grid gap-4 lg:grid-cols-2">
            {actions.map((a) => (
              <div key={a.participant_id} className="rise">
                <ActionCard a={a} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MentorInbox({ data, run, loading, escalations }: { data: MomentumResult | null; run: () => void; loading: boolean; escalations: string[] }) {
  return (
    <section>
      <StepHeader eyebrow="Mentor inbox" title="Who needs you today, and why">
        Every mentor gets a short list instead of a flood of pings. Nobody gets ghosted because their mentor had 30 mentees.
      </StepHeader>
      {!data && <Button onClick={run} loading={loading}>Build today&apos;s inboxes</Button>}
      {loading && <Thinking lines={2} steps={MOMENTUM_STEPS} />}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {mentors.map((m) => {
          const items = (data?.actions ?? []).filter((a) => participantsById[a.participant_id]?.mentor === m.name);
          const asks = m.name === "Nicole" ? escalations : [];
          if (data == null && asks.length === 0) return null;
          return (
            <div key={m.name} className="rounded-2xl border border-line bg-surface-2/60 p-4">
              <div className="mb-4 flex items-center gap-3">
                <Avatar name={m.name} size={36} />
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted">{m.mentees} mentees · {items.length + asks.length} need you</p>
                </div>
              </div>
              {m.days_since_last_reply > 5 && (
                <p className="mb-3 rounded-xl bg-coral-soft px-3 py-2 text-xs text-coral">Last replied {m.days_since_last_reply} days ago. Two mentees are waiting.</p>
              )}
              <div className="space-y-3">
                {asks.map((brief, i) => (
                  <div key={i} className="rounded-2xl border border-amber/40 bg-amber-soft p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber">
                      <Avatar name="Maya R." size={18} /> Question from Maya
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{brief}</p>
                  </div>
                ))}
                {items.map((a) => <ActionCard key={a.participant_id} a={a} compact />)}
                {data && items.length === 0 && asks.length === 0 && <p className="text-sm text-muted">All mentees on track. ✓</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const categoryTone = { constructive: "mint", blunt: "neutral", condescending: "amber", hostile: "coral", harassment: "coral" } as const;

function SafetyWatch() {
  const api = useApi<Safety & { mock: boolean }>("/api/ai/safety");
  const d = api.data;
  const byId = Object.fromEntries((d?.items ?? []).map((i) => [i.id, i]));
  const flagged = (d?.items ?? []).filter((i) => i.flag_organizer).length;
  return (
    <section>
      <StepHeader eyebrow="Safety watch" title="Patterns, not just incidents">
        The same classifier as Maya&apos;s tone shield, run across every PR thread and channel, so organizers can act before someone quietly leaves.
      </StepHeader>
      <Button onClick={() => api.run()} loading={api.loading}>Scan program channels</Button>
      <ErrorText error={api.error} />
      {api.loading && <Thinking lines={3} steps={["reading 7 recent comments…", "separating blunt from belittling…", "looking for patterns by person…"]} />}
      {d && !api.loading && (
        <div className="rise mt-8 space-y-4">
          <div className="rounded-2xl bg-ink p-6 text-bg shadow-card">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{flagged} of {threads.length} need attention</p>
              <MockBadge on={d.mock} />
            </div>
            <p className="font-display text-lg leading-relaxed">{d.summary}</p>
          </div>
          {threads.map((t) => {
            const r = byId[t.id];
            return (
              <div key={t.id} className={`rounded-2xl border p-4 ${r?.flag_organizer ? "border-coral/40 bg-surface shadow-card" : "border-line bg-surface-2/50"}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium">{t.author}</span>
                  <span className="text-muted">in {t.where}</span>
                  <span className="ml-auto flex gap-1.5">
                    {r && <Pill tone={categoryTone[r.category]}>{r.category}</Pill>}
                    {r?.bias && <Pill tone="coral">identity-based</Pill>}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${r?.flag_organizer ? "" : "text-muted"}`}>&ldquo;{t.text}&rdquo;</p>
                {r?.flag_organizer && <p className="mt-2 text-xs text-coral">⚑ {r.flag_reason}{r.bias_note ? ` ${r.bias_note}` : ""}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Impact({ actions, run, loading }: { actions?: Action[]; run: () => void; loading: boolean }) {
  const bt = actions ? backtest(actions) : null;
  const future = cohort.participants.filter((p) => p._outcome_dropped_on_day != null && p._outcome_dropped_on_day > cohort.today);
  const flagged = new Set((actions ?? []).filter((a) => a.urgency !== "watch").map((a) => a.participant_id));
  // Zoom the axis to the window that matters: today → the last dropout.
  const minDay = cohort.today - 2;
  const maxDay = 28;
  const x = (day: number) => `${((day - minDay) / (maxDay - minDay)) * 100}%`;
  return (
    <section>
      <StepHeader eyebrow="Impact" title="Would the co-pilot have caught them?">
        We hid who actually dropped out from the agent, then compared its day-21 flags with what really happened. Programs count sign-ups; this counts the women we kept.
      </StepHeader>
      {!bt ? (
        <>
          <Button onClick={run} loading={loading}>Run the co-pilot and score it</Button>
          {loading && <Thinking lines={2} steps={MOMENTUM_STEPS} />}
        </>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-ink p-5 text-bg shadow-card">
              <p className="font-display text-5xl font-medium tabular-nums">{bt.caught.length}<span className="text-2xl opacity-60">/{bt.would_drop}</span></p>
              <p className="mt-1 text-sm opacity-80">future dropouts caught</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="font-display text-5xl font-medium tabular-nums">{bt.avg_days_early}<span className="text-2xl text-muted"> days</span></p>
              <p className="mt-1 text-sm text-muted">average warning before they&apos;d leave</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <p className="font-display text-5xl font-medium tabular-nums">{bt.false_alarms.length}</p>
              <p className="mt-1 text-sm text-muted">false alarms</p>
            </div>
          </div>
          <Card>
            <p className="mb-4 text-sm font-medium">Timeline: flagged on day {cohort.today} → would have left on</p>
            <div className="space-y-3">
              {future.map((p) => {
                const drop = p._outcome_dropped_on_day as number;
                const caught = flagged.has(p.id);
                return (
                  <div key={p.id} className="grid grid-cols-[110px_1fr] items-center gap-3 text-sm sm:grid-cols-[140px_1fr]">
                    <span className="flex items-center gap-2 truncate">
                      <Avatar name={p.name} size={22} /> {p.name}
                    </span>
                    <div className="relative h-6 rounded-full bg-surface-2">
                      <div
                        className={`absolute inset-y-1 rounded-full ${caught ? "bg-mint-soft" : "bg-coral-soft"}`}
                        style={{ left: x(cohort.today), width: `calc(${x(drop)} - ${x(cohort.today)})` }}
                      />
                      <span className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${caught ? "bg-mint" : "bg-line"}`} style={{ left: x(cohort.today) }} title="flagged" />
                      <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral" style={{ left: x(drop) }} title={`would leave day ${drop}`} />
                      <span className="absolute -top-0.5 right-2 text-xs text-muted">{caught ? `${drop - cohort.today}d early` : "missed"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-[110px_1fr] gap-3 text-xs text-muted sm:grid-cols-[140px_1fr]">
              <span />
              <div className="relative h-4">
                {[cohort.today, 24, 28].map((d) => (
                  <span key={d} className={`absolute whitespace-nowrap ${d === 28 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: x(d) }}>{d === cohort.today ? `day ${d} · today` : `day ${d}`}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-mint" /> flagged by co-pilot</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-coral" /> day she would have left</span>
            </div>
            {bt.already_lost.length > 0 && (
              <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
                Already gone before day {cohort.today}: {bt.already_lost.join(", ")}. That&apos;s why it has to run every week, not at the final report.
              </p>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}
