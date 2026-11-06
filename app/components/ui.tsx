"use client";

import { useState, type ReactNode } from "react";

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

export function Button({ onClick, loading, children, label, variant = "primary" }: { onClick: () => void; loading?: boolean; children: ReactNode; label?: string; variant?: "primary" | "ghost" }) {
  const base = "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-violet-600 text-white hover:bg-violet-700"
      : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";
  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${styles}`}>
      {loading ? (label ?? "Thinking…") : children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-neutral-200 p-4 dark:border-neutral-800 ${className}`}>{children}</div>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "violet" | "red" | "amber" | "green" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
    violet: "bg-violet-100 text-violet-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function MockBadge({ on }: { on?: boolean }) {
  return on ? <Pill tone="amber">mock data</Pill> : null;
}

export function ErrorText({ error }: { error: string }) {
  return error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null;
}

export const label = (s: string) => s.replaceAll("_", " ");
