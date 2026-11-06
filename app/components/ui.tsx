"use client";

import { useEffect, useState, type ReactNode } from "react";

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function run(body: object = {}): Promise<T | null> {
    setLoading(true);
    setError("");
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
