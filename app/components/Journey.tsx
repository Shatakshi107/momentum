"use client";

import { useState } from "react";
import hero from "@/data/hero.json";
import threads from "@/data/threads.json";
import type { Match } from "@/lib/match";
import type { Ask } from "@/lib/ask";
import type { Review } from "@/lib/review";
import type { Tone } from "@/lib/tone";
import type { Proof } from "@/lib/proof";
import { useApi, Button, Card, Pill, MockBadge, ErrorText, label } from "./ui";

const STEPS = ["Match", "Ask", "Review", "Shield", "Proof"] as const;
type Mock = { mock: boolean };

export default function Journey({ onEscalate }: { onEscalate: (brief: string) => void }) {
  const [step, setStep] = useState(0);
  return (
    <div>
      <Card className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="font-semibold">{hero.name}</span>
        <span className="text-neutral-500">{hero.location}</span>
        <span className="text-neutral-500">{hero.year}</span>
        <span className="text-neutral-500">{hero.hours_per_week} hrs/week</span>
        <span className="text-neutral-500">{hero.constraints}</span>
      </Card>
      <ol className="mb-6 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => setStep(i)}
              className={`w-full rounded-lg border px-2 py-2 text-left text-xs font-medium transition sm:text-sm ${
                i === step
                  ? "border-violet-600 bg-violet-600 text-white"
                  : i < step
                    ? "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200"
                    : "border-neutral-200 text-neutral-500 dark:border-neutral-800"
              }`}
            >
              <span className="block opacity-70">{i + 1}</span>
              {s}
            </button>
          </li>
        ))}
      </ol>
      {step === 0 && <MatchStep />}
      {step === 1 && <AskStep onEscalate={onEscalate} />}
      {step === 2 && <ReviewStep />}
      {step === 3 && <ShieldStep />}
      {step === 4 && <ProofStep />}
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))}>
          ← Back
        </Button>
        {step < STEPS.length - 1 && <Button onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1]} →</Button>}
      </div>
    </div>
  );
}

function StepIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{children}</p>
    </div>
  );
}

function MatchStep() {
  const api = useApi<Match & Mock>("/api/ai/match");
  const d = api.data;
  return (
    <section>
      <StepIntro title="An issue that fits her real week">
        Not the most impressive issue: the one she can finish. Her goal: “{hero.goal}.”
      </StepIntro>
      <Button onClick={() => api.run()} loading={api.loading} label="Matching…">Find my first issue</Button>
      <ErrorText error={api.error} />
      {d && (
        <div className="mt-5 space-y-3">
          <MockBadge on={d.mock} />
          {d.matches.map((m, i) => (
            <Card key={m.issue_id} className={i === 0 ? "border-violet-400 dark:border-violet-700" : ""}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-neutral-500">{m.issue_id}</span>
                <span className="font-medium">{m.title}</span>
                <span className="ml-auto"><Pill tone="violet">{m.fit}% fit</Pill></span>
              </div>
              <p className="mt-2 text-sm">{m.why_it_fits}</p>
              <p className="mt-2 text-xs text-neutral-500">
                ~{m.weeks_at_her_pace} weeks at her pace · First step: {m.first_step}
              </p>
            </Card>
          ))}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-neutral-500">Tempting, but not right now</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {d.avoid.map((a) => (
                <li key={a.issue_id}>
                  <span className="font-mono text-neutral-500">{a.issue_id}</span> {a.title}: <span className="text-neutral-500">{a.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

const ASK_PRESETS = ["What does collate_fn do, and where should my fix go?", "Can I add a skip_empty argument to DataLoader?"];

function AskStep({ onEscalate }: { onEscalate: (brief: string) => void }) {
  const api = useApi<Ask & Mock>("/api/ai/ask");
  const [q, setQ] = useState(ASK_PRESETS[0]);
  const [log, setLog] = useState<{ q: string; a: Ask & Mock }[]>([]);
  async function ask() {
    const a = await api.run({ question: q });
    if (!a) return;
    setLog((l) => [...l, { q, a }]);
    if (a.mode === "escalate" && a.mentor_brief) onEscalate(a.mentor_brief);
  }
  return (
    <section>
      <StepIntro title="Questions she'd never ask in public">
        Answers come from the repo&apos;s own docs. Anything that needs a human decision goes to her mentor with a brief, so she never has to explain it twice.
      </StepIntro>
      <div className="mb-2 flex flex-wrap gap-2">
        {ASK_PRESETS.map((p) => (
          <button key={p} onClick={() => setQ(p)} className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
            {p}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
        <Button onClick={ask} loading={api.loading} label="Asking…">Ask privately</Button>
      </div>
      <ErrorText error={api.error} />
      <div className="mt-5 space-y-4">
        {log.map(({ q, a }, i) => (
          <div key={i} className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-violet-600 px-4 py-2 text-sm text-white">{q}</p>
            <Card className={a.mode === "escalate" ? "border-amber-300 dark:border-amber-800" : ""}>
              <div className="mb-1 flex gap-2">
                {a.mode === "escalate" ? <Pill tone="amber">sent to mentor</Pill> : <Pill tone="green">answered from repo docs</Pill>}
                <MockBadge on={a.mock} />
              </div>
              <p className="text-sm">{a.answer}</p>
              {a.look_at.length > 0 && <p className="mt-2 text-xs text-neutral-500">Look at: {a.look_at.join(" · ")}</p>}
              {a.mentor_brief && <pre className="mt-3 whitespace-pre-wrap rounded bg-neutral-50 p-3 text-xs dark:bg-neutral-900">Brief for Nicole:{"\n"}{a.mentor_brief}</pre>}
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}

const severityTone = { blocker: "red", should_fix: "amber", nit: "neutral" } as const;

function ReviewStep() {
  const api = useApi<{ review: Review; mock: boolean; title: string }>("/api/review");
  const [prUrl, setPrUrl] = useState("demo");
  const d = api.data;
  const r = d?.review;
  return (
    <section>
      <StepIntro title="A review that teaches">
        Strengths first, then guiding questions instead of fixes. The maintainer gets a 3-line summary. Use &quot;demo&quot; for Maya&apos;s PR, or paste any public GitHub PR.
      </StepIntro>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={prUrl} onChange={(e) => setPrUrl(e.target.value)} className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
        <Button onClick={() => api.run({ prUrl })} loading={api.loading} label="Reviewing…">Coach this PR</Button>
      </div>
      <ErrorText error={api.error} />
      {r && d && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
          <div className="space-y-3">
            <h3 className="font-medium">For Maya <MockBadge on={d.mock} /></h3>
            <p className="text-xs text-neutral-500">{d.title}</p>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-300">
              {r.strengths.map((s) => <li key={s}>✓ {s}</li>)}
            </ul>
            {r.coaching.map((c, i) => (
              <Card key={i}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Pill tone={severityTone[c.severity]}>{label(c.severity)}</Pill>
                  <span className="font-mono text-neutral-500">{c.file} · {c.line_hint}</span>
                </div>
                <p className="mt-2 text-sm">{c.what}</p>
                <p className="mt-1 text-sm text-neutral-500">{c.why}</p>
                <p className="mt-2 text-sm font-medium text-violet-700 dark:text-violet-300">💭 {c.question}</p>
              </Card>
            ))}
            <Card className="bg-neutral-50 dark:bg-neutral-900">
              <h4 className="text-sm font-medium">Before a human reviews: can you answer these?</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{r.understanding_check.map((q) => <li key={q}>{q}</li>)}</ol>
            </Card>
          </div>
          <Card className="h-fit">
            <h3 className="text-sm font-medium">For the maintainer</h3>
            <div className="mt-2"><Pill tone="violet">{label(r.readiness)}</Pill></div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{r.maintainer_summary}</p>
          </Card>
        </div>
      )}
    </section>
  );
}

const categoryTone = { constructive: "green", blunt: "neutral", condescending: "amber", hostile: "red", harassment: "red" } as const;
const SHIELD_PRESETS = threads.filter((t) => ["c2", "c5"].includes(t.id));

function ShieldStep() {
  const api = useApi<Tone & Mock>("/api/ai/tone");
  const [text, setText] = useState(SHIELD_PRESETS[0].text);
  const d = api.data;
  return (
    <section>
      <StepIntro title="The comment that makes women quit">
        Every real technical point stays. The attack doesn&apos;t reach her alone, and the organizer hears about it.
      </StepIntro>
      <div className="mb-2 flex flex-wrap gap-2">
        {SHIELD_PRESETS.map((p) => (
          <button key={p.id} onClick={() => setText(p.text)} className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
            {p.where}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
      <div className="mt-2"><Button onClick={() => api.run({ text, context: "Review comment on Maya's first PR (#547, fixing issue #512)" })} loading={api.loading} label="Shielding…">Shield this comment</Button></div>
      <ErrorText error={api.error} />
      {d && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="border-red-200 dark:border-red-900">
            <h3 className="text-sm font-medium text-neutral-500">What was written</h3>
            <p className="mt-2 text-sm line-through decoration-red-400/60">{text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone={categoryTone[d.category]}>{d.category}</Pill>
              {d.bias && <Pill tone="red">identity-based</Pill>}
              <MockBadge on={d.mock} />
            </div>
            {d.bias_note && <p className="mt-2 text-xs text-neutral-500">{d.bias_note}</p>}
          </Card>
          <Card className="border-violet-300 dark:border-violet-800">
            <h3 className="text-sm font-medium text-violet-700 dark:text-violet-300">What Maya sees</h3>
            <p className="mt-2 text-sm">{d.shielded}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">{d.next_steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <p className="mt-3 text-sm italic text-neutral-500">{d.reassurance}</p>
          </Card>
          {d.flag_organizer && (
            <Card className="md:col-span-2 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm"><span className="font-medium">⚑ Flagged to organizer:</span> {d.flag_reason}</p>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

function ProofStep() {
  const api = useApi<Proof & Mock>("/api/ai/proof");
  const d = api.data;
  return (
    <section>
      <StepIntro title="Merged. Now say it like it is.">
        Women tend to undersell their work. Every line here is backed by evidence from her PR, with no hype.
      </StepIntro>
      <Card className="mb-3">
        <h3 className="text-xs font-medium uppercase text-neutral-500">Her draft</h3>
        <p className="mt-1 text-sm italic">&ldquo;{hero.self_description_draft}&rdquo;</p>
      </Card>
      <Button onClick={() => api.run()} loading={api.loading} label="Building…">Build my proof profile</Button>
      <ErrorText error={api.error} />
      {d && (
        <div className="mt-5 space-y-4">
          <MockBadge on={d.mock} />
          <div className="space-y-2">
            {d.underselling.map((u) => (
              <p key={u.phrase} className="text-sm">
                <span className="rounded bg-amber-100 px-1 text-amber-900 line-through">{u.phrase}</span> → <span className="font-medium">{u.rewrite}</span>
                <span className="text-neutral-500">: {u.why}</span>
              </p>
            ))}
          </div>
          <Card>
            <h3 className="text-sm font-medium">Resume bullets</h3>
            <ul className="mt-2 space-y-3">
              {d.bullets.map((b) => (
                <li key={b.text} className="text-sm">
                  • {b.text}
                  <span className="block pl-3 text-xs text-neutral-500">Evidence: {b.evidence}</span>
                </li>
              ))}
            </ul>
          </Card>
          <div className="flex flex-wrap gap-2">{d.skills_shown.map((s) => <Pill key={s} tone="violet">{s}</Pill>)}</div>
          <Card className="bg-neutral-50 dark:bg-neutral-900">
            <h3 className="text-xs font-medium uppercase text-neutral-500">LinkedIn post</h3>
            <p className="mt-1 text-sm">{d.linkedin_post}</p>
          </Card>
        </div>
      )}
    </section>
  );
}
