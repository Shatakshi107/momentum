"use client";

import { useRef, useState } from "react";
import hero from "@/data/hero.json";
import threads from "@/data/threads.json";
import type { Match } from "@/lib/match";
import type { Ask, AskImage } from "@/lib/ask";
import type { Checkin } from "@/lib/checkin";
import type { Review } from "@/lib/review";
import type { Tone } from "@/lib/tone";
import type { Proof } from "@/lib/proof";
import { useApi, Button, Card, Pill, MockBadge, ErrorText, label, Avatar, Thinking, StepHeader, FitRing, SendButton } from "./ui";

const STEPS = [
  { name: "Match", hint: "Find a first issue" },
  { name: "Ask", hint: "Ask without fear" },
  { name: "Check in", hint: "Talk it out" },
  { name: "Review", hint: "Get coached" },
  { name: "Shield", hint: "Survive a harsh review" },
  { name: "Proof", hint: "Own what she shipped" },
] as const;
type Mock = { mock: boolean };
const MENTOR = "Nicole";

export default function Journey({ onEscalate, onCheckin }: { onEscalate: (brief: string) => void; onCheckin: (signal: string) => void }) {
  const [step, setStep] = useState(0);
  return (
    <div>
      <Persona />
      <Stepper step={step} setStep={setStep} />
      <div key={step} className="rise">
        {step === 0 && <MatchStep />}
        {step === 1 && <AskStep onEscalate={onEscalate} />}
        {step === 2 && <CheckinStep onCheckin={onCheckin} />}
        {step === 3 && <ReviewStep />}
        {step === 4 && <ShieldStep />}
        {step === 5 && <ProofStep />}
      </div>
      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))}>
          ← Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>Next: {STEPS[step + 1].name} →</Button>
        ) : (
          <span className="text-sm text-muted">End of Maya&apos;s journey. Switch to Program view →</span>
        )}
      </div>
    </div>
  );
}

function Persona() {
  return (
    <Card className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <Avatar name={hero.name} size={56} />
        <div>
          <p className="font-display text-xl font-medium">{hero.name}</p>
          <p className="text-sm text-muted">{hero.location} · {hero.year}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill tone="brand">{hero.hours_per_week} hrs/week</Pill>
            {hero.constraints.split("; ").map((c) => (
              <Pill key={c}>{c}</Pill>
            ))}
          </div>
        </div>
      </div>
      <blockquote className="border-line text-sm italic leading-relaxed text-muted sm:ml-auto sm:max-w-xs sm:border-l sm:pl-5">
        &ldquo;{hero.goal}.&rdquo;
      </blockquote>
    </Card>
  );
}

function Stepper({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  return (
    <ol className="relative mb-10 grid grid-cols-6">
      <div className="absolute left-[8.33%] right-[8.33%] top-4 h-0.5 bg-line" aria-hidden />
      <div
        className="absolute left-[8.33%] top-4 h-0.5 bg-brand transition-all duration-500"
        style={{ width: `${(step / (STEPS.length - 1)) * 83.33}%` }}
        aria-hidden
      />
      {STEPS.map((s, i) => (
        <li key={s.name} className="relative flex flex-col items-center text-center">
          <button
            data-step={i}
            onClick={() => setStep(i)}
            aria-current={i === step ? "step" : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
              i < step ? "border-brand bg-brand text-brand-ink" : i === step ? "border-brand bg-surface text-brand ring-4 ring-brand-soft" : "border-line bg-surface text-muted"
            }`}
          >
            {i < step ? "✓" : i + 1}
          </button>
          <span className={`mt-2 text-xs font-medium sm:text-sm ${i === step ? "text-ink" : "text-muted"}`}>{s.name}</span>
          <span className="hidden text-xs text-muted sm:block">{s.hint}</span>
        </li>
      ))}
    </ol>
  );
}

const LIVE_REPOS = ["huggingface/diffusers", "keras-team/keras", "jupyterlab/jupyterlab"];

function MatchStep() {
  const api = useApi<Match & Mock & { live?: { repo: string; count: number } }>("/api/ai/match");
  const [source, setSource] = useState<"demo" | "live">("demo");
  const [repo, setRepo] = useState(LIVE_REPOS[0]);
  const d = api.data;
  return (
    <section>
      <StepHeader eyebrow="Step 1 · Match" title="An issue that fits her real week">
        Not the most impressive issue: the one she can actually finish between shifts and midterms. A first PR that merges beats an ambitious one that stalls.
      </StepHeader>
      <Card className="mb-5 space-y-4">
        <div className="flex w-fit rounded-full border border-line p-1 text-sm">
          {(
            [
              ["demo", "Demo repo (tinyml-kit)"],
              ["live", "● Live from GitHub"],
            ] as const
          ).map(([id, t]) => (
            <button key={id} onClick={() => setSource(id)} className={`rounded-full px-3 py-1.5 font-medium transition ${source === id ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
        {source === "live" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">github.com/</span>
              <input value={repo} onChange={(e) => setRepo(e.target.value.trim())} className="flex-1 rounded-full border border-line bg-surface px-4 py-2 font-mono text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex flex-wrap gap-2">
              {LIVE_REPOS.map((r) => (
                <button key={r} onClick={() => setRepo(r)} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted transition hover:border-brand hover:text-brand">
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">Pulls real, currently open issues labeled &ldquo;good first issue&rdquo;, then ranks them for Maya.</p>
          </div>
        )}
        <Button onClick={() => api.run(source === "live" ? { repo } : {})} loading={api.loading}>Find Maya&apos;s first issue</Button>
      </Card>
      <ErrorText error={api.error} />
      {api.loading && (
        <Thinking
          steps={
            source === "live"
              ? [`fetching open good-first-issues from ${repo}…`, "reading each issue and sizing it for a first-timer…", "checking which are already claimed…", "ranking what Maya can finish…"]
              : ["reading Maya's skills and schedule…", "sizing 10 open issues for a first-timer…", "ranking what she can finish…"]
          }
        />
      )}
      {d && !api.loading && (
        <div className="rise mt-8 space-y-3">
          <div className="flex flex-wrap gap-2">
            <MockBadge on={d.mock} />
            {d.live && <Pill tone="mint">● Live · {d.live.count} open good-first-issues in {d.live.repo}</Pill>}
          </div>
          {d.matches.map((m, i) => (
            <Card key={m.issue_id} className={`flex gap-4 ${i === 0 ? "border-brand ring-1 ring-brand" : ""}`}>
              <FitRing value={m.fit} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {i === 0 && <Pill tone="brand">Best fit</Pill>}
                  {m.url ? (
                    <a href={m.url} target="_blank" rel="noreferrer" className="font-mono text-xs text-brand hover:underline">{m.issue_id} ↗</a>
                  ) : (
                    <span className="font-mono text-xs text-muted">{m.issue_id}</span>
                  )}
                </div>
                <p className="mt-1 font-medium">{m.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.why_it_fits}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  <span>⏱ ~{m.weeks_at_her_pace} weeks at her pace</span>
                  <span>→ First step: {m.first_step}</span>
                </div>
              </div>
            </Card>
          ))}
          {d.avoid.length > 0 && (
            <div className="rounded-2xl border border-dashed border-line p-5">
              <p className="text-sm font-medium">Tempting, but not right now</p>
              <ul className="mt-3 space-y-2">
                {d.avoid.map((a) => (
                  <li key={a.issue_id} className="text-sm">
                    <span className="font-mono text-xs text-muted">{a.issue_id}</span> <span className="font-medium">{a.title}</span>
                    <span className="block text-muted">{a.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export const ASK_PRESETS = ["What does collate_fn do, and where should my fix go?", "Can I add a skip_empty argument to DataLoader?"];

function AskStep({ onEscalate }: { onEscalate: (brief: string) => void }) {
  const api = useApi<Ask & Mock>("/api/ai/ask");
  const [q, setQ] = useState(ASK_PRESETS[0]);
  const [log, setLog] = useState<{ q: string; a: Ask & Mock; img?: string }[]>([]);
  const [image, setImage] = useState<AskImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  function attach(file: File | undefined) {
    if (!file || !/^image\/(png|jpeg|gif|webp)$/.test(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => setImage({ data: String(reader.result).split(",")[1], media_type: file.type as AskImage["media_type"] });
    reader.readAsDataURL(file);
  }
  async function ask() {
    const sent = image;
    const question = q || (sent ? "What does this error mean and how do I fix it?" : "");
    if (!question) return;
    const a = await api.run({ question, image: sent ?? undefined });
    if (!a) return;
    setLog((l) => [...l, { q: question, a, img: sent ? `data:${sent.media_type};base64,${sent.data}` : undefined }]);
    setImage(null);
    if (a.mode === "escalate" && a.mentor_brief) onEscalate(a.mentor_brief);
  }
  return (
    <section>
      <StepHeader eyebrow="Step 2 · Ask" title="The questions she'd never ask in public">
        Answers come straight from the repo&apos;s own docs. Anything that needs a human decision goes to her mentor with a brief, so she never has to explain twice or ask in front of everyone.
      </StepHeader>
      <Card className="p-0">
        <div className="max-h-[520px] space-y-5 overflow-y-auto p-5">
          {log.length === 0 && !api.loading && <p className="py-6 text-center text-sm text-muted">Private chat. Only Maya (and, if she needs it, {MENTOR}) can see this.</p>}
          {log.map(({ q, a }, i) => (
            <div key={i} className="rise space-y-3">
              <div className="flex justify-end gap-2">
                <div className="flex max-w-[80%] flex-col items-end gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {log[i].img && <img src={log[i].img} alt="Screenshot Maya attached" className="max-h-40 rounded-xl border border-line" />}
                  <p className="rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-brand-ink">{q}</p>
                </div>
                <Avatar name={hero.name} size={28} />
              </div>
              <div className="flex gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs text-brand">✦</span>
                <div className="max-w-[85%] space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {a.mode === "escalate" ? <Pill tone="amber">Sent to {MENTOR}</Pill> : <Pill tone="mint">Answered from repo docs</Pill>}
                    <MockBadge on={a.mock} />
                  </div>
                  <p className="rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3 text-sm leading-relaxed">{a.answer}</p>
                  {a.look_at.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {a.look_at.map((l) => (
                        <code key={l} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">{l}</code>
                      ))}
                    </div>
                  )}
                  {a.mentor_brief && (
                    <div className="rounded-xl border border-amber/40 bg-amber-soft p-3">
                      <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber">
                        <Avatar name={MENTOR} size={18} /> Brief for {MENTOR}
                      </p>
                      <p className="whitespace-pre-line text-sm">{a.mentor_brief}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {api.loading && (
            <p className="flex items-center gap-2 text-sm text-brand">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" /> Claude is reading {image ? "the screenshot and " : ""}the repo docs…
            </p>
          )}
        </div>
        <div className="space-y-3 border-t border-line p-4">
          <div className="flex flex-wrap gap-2">
            {ASK_PRESETS.map((p) => (
              <button key={p} onClick={() => setQ(p)} className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-brand hover:text-brand">
                {p}
              </button>
            ))}
            <button
              onClick={() => {
                setImage({ data: sampleErrorScreenshot(), media_type: "image/png" });
                setQ("I ran the tests and got this. What did I do wrong?");
              }}
              className="rounded-full border border-dashed border-brand px-3 py-1 text-xs text-brand transition hover:bg-brand-soft"
            >
              📸 Sample: terminal error screenshot
            </button>
          </div>
          {image && (
            <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:${image.media_type};base64,${image.data}`} alt="Attached screenshot" className="h-12 rounded-md" />
              <span className="text-xs text-muted">Screenshot attached</span>
              <button onClick={() => setImage(null)} className="ml-auto px-2 text-xs text-muted hover:text-coral">Remove</button>
            </div>
          )}
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => attach(e.target.files?.[0])} />
            <button
              onClick={() => fileRef.current?.click()}
              title="Attach a screenshot"
              aria-label="Attach a screenshot"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand"
            >
              📎
            </button>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onPaste={(e) => attach(e.clipboardData.files?.[0])}
              placeholder="Ask anything, or paste a screenshot of an error"
              onKeyDown={(e) => e.key === "Enter" && !api.loading && ask()}
              className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <Button onClick={ask} loading={api.loading}>Ask privately</Button>
          </div>
        </div>
      </Card>
      <ErrorText error={api.error} />
    </section>
  );
}

const severityTone = { blocker: "coral", should_fix: "amber", nit: "neutral" } as const;

function ReviewStep() {
  const api = useApi<{ review: Review; mock: boolean; title: string }>("/api/review");
  const [prUrl, setPrUrl] = useState("demo");
  const d = api.data;
  const r = d?.review;
  return (
    <section>
      <StepHeader eyebrow="Step 4 · Review" title="A review that teaches, not just corrects">
        Strengths first. Guiding questions instead of rewritten code. And a 3-line summary so the maintainer spends 30 seconds, not 30 minutes.
      </StepHeader>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="demo, or https://github.com/owner/repo/pull/123"
          className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 font-mono text-sm outline-none focus:border-brand"
        />
        <Button onClick={() => api.run({ prUrl })} loading={api.loading}>Coach this PR</Button>
      </div>
      <p className="mt-2 text-xs text-muted">Type <code>demo</code> for Maya&apos;s PR, or paste any public GitHub pull request.</p>
      <ErrorText error={api.error} />
      {api.loading && <Thinking steps={["reading the diff…", "checking it against the codebase's patterns…", "finding what she did well…", "writing questions instead of fixes…"]} />}
      {r && d && !api.loading && (
        <div className="rise mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-medium">For Maya</h3>
              <MockBadge on={d.mock} />
            </div>
            <p className="font-mono text-xs text-muted">{d.title}</p>
            <Card className="border-mint/30 bg-mint-soft">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mint">What you did well</p>
              <ul className="space-y-1.5 text-sm">{r.strengths.map((s) => <li key={s} className="flex gap-2"><span className="text-mint">✓</span>{s}</li>)}</ul>
            </Card>
            {r.coaching.map((c, i) => (
              <Card key={i}>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={severityTone[c.severity]}>{label(c.severity)}</Pill>
                  <code className="truncate text-xs text-muted">{c.file} · {c.line_hint}</code>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{c.what}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.why}</p>
                <p className="mt-3 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand">💭 {c.question}</p>
              </Card>
            ))}
            <Card className="bg-surface-2">
              <p className="text-sm font-semibold">Before a human reviews, can you answer these?</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">{r.understanding_check.map((q) => <li key={q}>{q}</li>)}</ol>
            </Card>
          </div>
          <aside className="h-fit rounded-2xl bg-ink p-5 text-bg shadow-card lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">For the maintainer · 30-second triage</p>
            <p className="mt-3 inline-block rounded-full bg-bg/15 px-3 py-1 text-xs font-medium">{label(r.readiness)}</p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed opacity-90">{r.maintainer_summary}</p>
          </aside>
        </div>
      )}
    </section>
  );
}

const categoryTone = { constructive: "mint", blunt: "neutral", condescending: "amber", hostile: "coral", harassment: "coral" } as const;
export const SHIELD_PRESETS = threads.filter((t) => ["c2", "c5"].includes(t.id));

function ShieldStep() {
  const api = useApi<Tone & Mock>("/api/ai/tone");
  const [text, setText] = useState(SHIELD_PRESETS[0].text);
  const [sent, setSent] = useState("");
  const [reveal, setReveal] = useState(false);
  const d = api.data;
  async function run() {
    setReveal(false);
    setSent(text);
    await api.run({ text, context: "Review comment on Maya's first PR (#547, fixing issue #512)" });
  }
  return (
    <section>
      <StepHeader eyebrow="Step 5 · Shield" title="The comment that makes women quit">
        Every real technical point stays. The attack doesn&apos;t reach her alone, and the organizer hears about it the same minute.
      </StepHeader>
      <Card>
        <p className="mb-2 text-xs font-medium text-muted">Incoming review comment</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {SHIELD_PRESETS.map((p) => (
            <button key={p.id} onClick={() => setText(p.text)} className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-brand hover:text-brand">
              {p.where} · {p.author}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand" />
        <div className="mt-3"><Button onClick={run} loading={api.loading}>Shield this comment</Button></div>
      </Card>
      <ErrorText error={api.error} />
      {api.loading && <Thinking lines={2} steps={["separating the technical point from the tone…", "rewriting it as clear next steps…", "checking if an organizer should know…"]} />}
      {d && !api.loading && (
        <div className="rise mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <Card className="border-brand ring-1 ring-brand">
              <div className="flex items-center gap-2">
                <Avatar name={hero.name} size={24} />
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">What Maya sees</p>
                <MockBadge on={d.mock} />
              </div>
              <p className="mt-4 text-[15px] leading-relaxed">{d.shielded}</p>
              <ol className="mt-4 space-y-2">
                {d.next_steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-line pt-4 text-sm italic text-muted">{d.reassurance}</p>
            </Card>
            <Card className="relative overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">What was written</p>
              <p className={`mt-4 text-sm leading-relaxed transition ${reveal ? "" : "select-none blur-sm"}`}>{sent}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Pill tone={categoryTone[d.category]}>{d.category}</Pill>
                {d.bias && <Pill tone="coral">identity-based</Pill>}
              </div>
              {d.bias_note && <p className="mt-2 text-xs text-muted">{d.bias_note}</p>}
              <button onClick={() => setReveal(!reveal)} className="mt-4 text-xs font-medium text-brand underline-offset-2 hover:underline">
                {reveal ? "Hide original" : "Reveal original (her choice)"}
              </button>
            </Card>
          </div>
          {d.flag_organizer && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-coral/40 bg-coral-soft p-4 text-sm">
              <span className="text-coral">⚑</span>
              <p className="flex-1"><span className="font-semibold text-coral">Flagged to the organizer.</span> {d.flag_reason}</p>
              <SendButton payload={{ kind: "alert", title: `Tone flag on Maya's PR #547 (${d.category})`, text: d.flag_reason, fields: [{ name: "Comment", value: sent }] }}>
                Alert #organizers
              </SendButton>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function highlight(text: string, phrases: string[]) {
  if (!phrases.length) return text;
  const re = new RegExp(`(${phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    phrases.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i} className="rounded bg-amber-soft px-0.5 text-amber line-through decoration-amber/60">{part}</mark>
    ) : (
      part
    ),
  );
}

function ProofStep() {
  const api = useApi<Proof & Mock>("/api/ai/proof");
  const d = api.data;
  return (
    <section>
      <StepHeader eyebrow="Step 6 · Proof" title="Merged. Now say it like it is.">
        Women tend to undersell their work. Every line here is backed by evidence from her PR. Accurate, not hyped.
      </StepHeader>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">How Maya described it</p>
        <p className="mt-2 font-display text-xl italic leading-snug">&ldquo;{d ? highlight(hero.self_description_draft, d.underselling.map((u) => u.phrase)) : hero.self_description_draft}&rdquo;</p>
        <div className="mt-4"><Button onClick={() => api.run()} loading={api.loading}>Build Maya&apos;s proof profile</Button></div>
      </Card>
      <ErrorText error={api.error} />
      {api.loading && <Thinking steps={["reading her merged PR and the review history…", "matching every claim to evidence…", "spotting where she undersold herself…"]} />}
      {d && !api.loading && (
        <div className="rise mt-6 space-y-6">
          <MockBadge on={d.mock} />
          <div className="grid gap-3 sm:grid-cols-2">
            {d.underselling.map((u) => (
              <div key={u.phrase} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-sm">
                  <span className="text-amber line-through">{u.phrase}</span> <span className="text-muted">→</span> <span className="font-semibold">{u.rewrite}</span>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{u.why}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <Card className="font-[family-name:var(--font-display)]">
              <div className="border-b border-line pb-3">
                <p className="text-lg font-medium">{hero.name.replace(".", "")}</p>
                <p className="font-sans text-xs text-muted">Open-source contributor · tinyml-kit</p>
              </div>
              <ul className="mt-4 space-y-4 font-sans">
                {d.bullets.map((b) => (
                  <li key={b.text}>
                    <p className="text-sm leading-relaxed">• {b.text}</p>
                    <p className="mt-1 pl-3 text-xs text-muted">Evidence: {b.evidence}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-1.5 font-sans">{d.skills_shown.map((s) => <Pill key={s} tone="brand">{s}</Pill>)}</div>
            </Card>
            <Card className="h-fit">
              <div className="flex items-center gap-3">
                <Avatar name={hero.name} size={36} />
                <div>
                  <p className="text-sm font-semibold">{hero.name}</p>
                  <p className="text-xs text-muted">{hero.location} · now</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed">{d.linkedin_post}</p>
              <p className="mt-4 text-xs text-muted">Draft LinkedIn post</p>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}

/** Draws a realistic terminal screenshot on a canvas, so the vision demo needs no image files. */
export function sampleErrorScreenshot(): string {
  const lines: [string, string][] = [
    ["#9aa5ce", "maya@macbook tinyml-kit % pytest -q tests/test_loader.py"],
    ["#e0e0e0", "ImportError while importing test module '/Users/maya/tinyml-kit/tests/test_loader.py'."],
    ["#e0e0e0", "Hint: make sure your test modules/packages have valid Python names."],
    ["#e0e0e0", "Traceback:"],
    ["#e0e0e0", "tests/test_loader.py:1: in <module>"],
    ["#e0e0e0", "    from tinyml.data import DataLoader"],
    ["#ff6b6b", "E   ModuleNotFoundError: No module named 'tinyml'"],
    ["#ff6b6b", "=================== 1 error in 0.08s ==================="],
  ];
  const c = document.createElement("canvas");
  c.width = 1000;
  c.height = 80 + lines.length * 30;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1a1b26";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#24253a";
  g.fillRect(0, 0, c.width, 36);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(22 + i * 22, 18, 7, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = "#9aa5ce";
  g.font = "14px Menlo, monospace";
  g.fillText("zsh — tinyml-kit", c.width / 2 - 60, 23);
  g.font = "17px Menlo, monospace";
  lines.forEach(([col, t], i) => {
    g.fillStyle = col;
    g.fillText(t, 20, 70 + i * 30);
  });
  return c.toDataURL("image/png").split(",")[1];
}

export const SAMPLE_CHECKIN =
  "Hey, it's Maya. Um, I've been stuck on the tests for like three days. I reproduced the crash, which felt good, but I'm not sure my fix is even in the right file. Midterms are coming up so I basically only have my BART ride. Honestly I'm kind of wondering if this is for me.";

type SR = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void;
  onend: () => void;
  onerror: (e: { error: string }) => void;
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = window.speechSynthesis.getVoices().find((v) => /Samantha|Google US English|Ava|Allison/.test(v.name));
  if (voice) u.voice = voice;
  u.rate = 1.02;
  window.speechSynthesis.speak(u);
}

function CheckinStep({ onCheckin }: { onCheckin: (signal: string) => void }) {
  const api = useApi<Checkin & Mock>("/api/ai/checkin");
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState("");
  const recRef = useRef<SR | null>(null);
  const d = api.data;

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setMicNote("Voice input needs Chrome. You can type or use the sample instead.");
      return;
    }
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    let finalText = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      setText((finalText + interim).trim());
    };
    r.onerror = (e) => setMicNote(e.error === "not-allowed" ? "Microphone permission was blocked." : `Mic error: ${e.error}`);
    r.onend = () => setListening(false);
    recRef.current = r;
    setMicNote("");
    setText("");
    r.start();
    setListening(true);
  }

  async function send() {
    recRef.current?.stop();
    const out = await api.run({ transcript: text });
    if (!out) return;
    speak(out.spoken_reply);
    onCheckin(`${hero.name} (p09) voice check-in: ${out.organizer_signal}`);
  }

  const stressTone = { low: "mint", medium: "amber", high: "coral" } as const;
  return (
    <section>
      <StepHeader eyebrow="Step 3 · Check in" title="Thirty seconds, out loud, on the train">
        Typing a status update feels like homework. Talking doesn&apos;t. Maya checks in by voice on BART, hears a real answer back, and the program learns she&apos;s struggling before she goes quiet.
      </StepHeader>
      <Card className="flex flex-col items-center gap-5 py-8 text-center">
        <button
          onClick={toggleMic}
          aria-pressed={listening}
          aria-label={listening ? "Stop recording" : "Start voice check-in"}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full text-3xl transition ${listening ? "bg-coral text-white" : "bg-brand text-brand-ink hover:brightness-110"}`}
        >
          {listening && <span className="absolute inset-0 animate-ping rounded-full bg-coral opacity-30" />}
          <span className="relative">{listening ? "■" : "🎙"}</span>
        </button>
        <p className="text-sm text-muted">{listening ? "Listening… tap to stop" : "Tap to talk, or use the sample check-in"}</p>
        {micNote && <p className="text-xs text-coral">{micNote}</p>}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Your words appear here as you speak"
          className="w-full max-w-2xl resize-none rounded-xl border border-line bg-surface-2 px-4 py-3 text-left text-sm leading-relaxed outline-none focus:border-brand"
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="ghost" onClick={() => setText(SAMPLE_CHECKIN)}>Use sample check-in</Button>
          <Button onClick={send} loading={api.loading}>Send check-in</Button>
        </div>
      </Card>
      <ErrorText error={api.error} />
      {api.loading && <Thinking lines={2} steps={["listening for what's blocking her…", "and for how she's feeling…", "picking one step that fits a BART ride…"]} />}
      {d && !api.loading && (
        <div className="rise mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-brand ring-1 ring-brand">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-sm text-brand">🔊</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">Momentum replied out loud</p>
              <MockBadge on={d.mock} />
            </div>
            <p className="mt-4 font-display text-xl leading-relaxed">&ldquo;{d.spoken_reply}&rdquo;</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="sm" variant="soft" onClick={() => speak(d.spoken_reply)}>▶ Play again</Button>
              <span className="text-sm"><span className="font-medium">Next 30 minutes:</span> {d.next_step}</span>
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">What the program learned</p>
              <Pill tone={stressTone[d.stress]}>stress: {d.stress}</Pill>
            </div>
            {d.blockers.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Blockers</p>
                <ul className="mt-1 space-y-1 text-sm">{d.blockers.map((b) => <li key={b}>• {b}</li>)}</ul>
              </div>
            )}
            {d.wins.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Wins</p>
                <ul className="mt-1 space-y-1 text-sm text-mint">{d.wins.map((b) => <li key={b}>✓ {b}</li>)}</ul>
              </div>
            )}
            <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
              <span className="font-medium text-ink">Sent to the co-pilot:</span> {d.organizer_signal}
            </p>
            {d.needs_human && <p className="rounded-xl bg-coral-soft p-3 text-sm text-coral">A real person ({MENTOR}) will reach out today.</p>}
          </Card>
        </div>
      )}
    </section>
  );
}
