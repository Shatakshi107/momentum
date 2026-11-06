"use client";

import { useEffect, useState, type ReactNode } from "react";

// Demo cache: the recorded tour pre-runs every live Claude call once, then replays
// the real responses instantly so the video has no dead air.
export const demoCache = new Map<string, unknown>();
export const cacheKey = (path: string, body: object) => path + JSON.stringify(body, (k, v) => (k === "image" ? "img" : v));
export async function prefetch<T>(path: string, body: object = {}): Promise<T> {
  const res = await fetch(path, { method: "POST", body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `${path} failed`);
  demoCache.set(cacheKey(path, body), json);
  return json as T;
}

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function run(body: object = {}): Promise<T | null> {
    setLoading(true);
    setError("");
    const cached = demoCache.get(cacheKey(path, body)) as T | undefined;
    if (cached) {
      await new Promise((r) => setTimeout(r, 1200)); // let the "Claude is…" state show briefly
      setData(cached);
      setLoading(false);
      return cached;
    }
    try {
      const res = await fetch(path, { method: "POST", body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setData(json);
      return json;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }
  return { data, loading, error, run };
}

export function Button({
  onClick,
  loading,
  children,
  variant = "primary",
  size = "md",
}: {
  onClick: () => void;
  loading?: boolean;
  children: ReactNode;
  variant?: "primary" | "ghost" | "soft";
  size?: "sm" | "md";
}) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm" };
  const variants = {
    primary: "bg-brand text-brand-ink shadow-card hover:brightness-110",
    ghost: "border border-line text-ink hover:bg-surface-2",
    soft: "bg-brand-soft text-brand hover:brightness-95",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-wait disabled:opacity-60 ${sizes[size]} ${variants[variant]}`}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 shadow-card ${className}`}>{children}</div>;
}

type Tone = "neutral" | "brand" | "coral" | "amber" | "mint";
const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  brand: "bg-brand-soft text-brand",
  coral: "bg-coral-soft text-coral",
  amber: "bg-amber-soft text-amber",
  mint: "bg-mint-soft text-mint",
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}>{children}</span>;
}

export function MockBadge({ on }: { on?: boolean }) {
  return on ? <Pill tone="amber">cached demo data</Pill> : null;
}

export function ErrorText({ error }: { error: string }) {
  return error ? <p className="mt-4 rounded-xl bg-coral-soft px-4 py-3 text-sm text-coral">{error}</p> : null;
}

export const label = (s: string) => s.replaceAll("_", " ");

const AVATAR_COLORS = ["#5b3fd6", "#d9472b", "#1b7f53", "#a86a12", "#2b6cb0", "#b83280", "#2c7a7b"];
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** Live Claude calls take 5-45s. Show what's happening instead of a frozen screen. */
export function Thinking({ steps, lines = 3 }: { steps: string[]; lines?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 3500);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="rise mt-6 space-y-3" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-brand">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
        </span>
        Claude is {steps[i]}
      </p>
      {Array.from({ length: lines }).map((_, k) => (
        <div key={k} className="skeleton h-16" style={{ opacity: 1 - k * 0.25 }} />
      ))}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{children}</p>;
}

export function StepHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mb-6 max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export function FitRing({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(var(--brand) ${value * 3.6}deg, var(--surface-2) 0deg)` }}
      aria-label={`${value}% fit`}
    >
      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-full bg-surface">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        <span className="-mt-1 text-[9px] uppercase text-muted">fit</span>
      </div>
    </div>
  );
}

type NotifyPayload = { kind: "message" | "alert"; title: string; text: string; fields?: { name: string; value: string }[] };

// Discord is a visual mock for the demo: nothing is actually sent anywhere.
const CHANNEL = { message: "pod-14", alert: "organizers" } as const;
const BLURPLE = "#5865F2";

export function DiscordLogo({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

export function IntegrationBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ background: BLURPLE }}>
      <DiscordLogo size={13} color="#fff" /> Discord connected
    </span>
  );
}

/** Looks like a Discord message from the Momentum app, for the "sent" state. */
function DiscordPreview({ payload }: { payload: NotifyPayload }) {
  const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <div className="rise mt-3 rounded-lg p-3 text-left text-[13px]" style={{ background: "#313338", color: "#dbdee1" }}>
      <p className="mb-2 flex items-center gap-1 text-xs" style={{ color: "#949ba4" }}>
        <DiscordLogo size={12} color="#949ba4" /> # {CHANNEL[payload.kind]}
      </p>
      <div className="flex gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">M</span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-white">Momentum</span>
            <span className="rounded px-1 text-[10px] font-semibold text-white" style={{ background: BLURPLE }}>APP</span>
            <span className="text-[11px]" style={{ color: "#949ba4" }}>Today at {time}</span>
          </p>
          <div className="mt-1 rounded border-l-4 p-2.5" style={{ background: "#2b2d31", borderColor: payload.kind === "alert" ? "#d9472b" : "#5b3fd6" }}>
            <p className="font-semibold text-white">{payload.title}</p>
            <p className="mt-1 whitespace-pre-line leading-snug">{payload.text}</p>
            {payload.fields?.map((f) => (
              <p key={f.name} className="mt-1.5 text-xs">
                <span className="font-semibold text-white">{f.name}:</span> {f.value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mock "send to Discord": a short delay, then a Discord-style preview of the post. */
export function SendButton({ payload, children }: { payload: NotifyPayload; children: ReactNode }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  function send() {
    setState("sending");
    setTimeout(() => setState("done"), 700);
  }
  if (state === "done")
    return (
      <div className="w-full">
        <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-mint">
          ✓ Posted to <DiscordLogo size={12} color={BLURPLE} /> #{CHANNEL[payload.kind]}
        </p>
        <DiscordPreview payload={payload} />
      </div>
    );
  return (
    <button
      onClick={send}
      disabled={state === "sending"}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-110 disabled:opacity-60"
      style={{ background: BLURPLE }}
    >
      {state === "sending" ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <DiscordLogo size={14} color="#fff" />}
      {children}
    </button>
  );
}
