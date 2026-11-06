import cohort from "@/data/cohort.json";
import type { Action } from "./momentum";

// Outcome metrics (#10) and backtest (#11). Plain TypeScript, no Claude.

type P = (typeof cohort.participants)[number];
const firstDay = (p: P, type: string) => p.events.find((e) => e.type === type)?.day;
const count = (p: P, type: string) => p.events.filter((e) => e.type === type).length;
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function cohortMetrics() {
  const ps = cohort.participants;
  const today = cohort.today;
  const n = ps.length;
  const toFirstReview = ps.flatMap((p) => {
    const a = firstDay(p, "pr_opened");
    const b = firstDay(p, "review_received");
    return a != null && b != null ? [b - a] : [];
  });
  const toMerge = ps.flatMap((p) => {
    const a = firstDay(p, "pr_opened");
    const b = firstDay(p, "pr_merged");
    return a != null && b != null ? [b - a] : [];
  });
  const waitingOnUs = ps.flatMap((p) => p.open_prs.filter((pr) => pr.waiting_on === "maintainer" && pr.days_waiting > 7));
  return {
    participants: n,
    active_last_7_days: ps.filter((p) => (p.events.at(-1)?.day ?? 0) >= today - 7).length,
    first_merge: ps.filter((p) => count(p, "pr_merged") >= 1).length,
    second_merge: ps.filter((p) => count(p, "pr_merged") >= 2).length,
    second_pr_opened: ps.filter((p) => count(p, "pr_opened") >= 2).length,
    median_days_to_first_review: median(toFirstReview),
    median_days_to_merge: median(toMerge),
    prs_waiting_on_maintainer_over_7_days: waitingOnUs.length,
  };
}

export function backtest(actions: Action[]) {
  const today = cohort.today;
  const flagged = new Set(actions.filter((a) => a.urgency !== "watch" && a.diagnosis !== "on_track").map((a) => a.participant_id));
  // People who would have dropped AFTER today: the ones the co-pilot could still save.
  const future = cohort.participants.filter((p) => p._outcome_dropped_on_day != null && p._outcome_dropped_on_day > today);
  const caught = future.filter((p) => flagged.has(p.id));
  const missed = future.filter((p) => !flagged.has(p.id));
  const falseAlarms = [...flagged].filter((id) => !future.some((p) => p.id === id));
  const daysEarly = caught.map((p) => (p._outcome_dropped_on_day as number) - today);
  return {
    would_drop: future.length,
    caught: caught.map((p) => p.name),
    missed: missed.map((p) => p.name),
    false_alarms: falseAlarms,
    avg_days_early: daysEarly.length ? Math.round((daysEarly.reduce((a, b) => a + b, 0) / daysEarly.length) * 10) / 10 : 0,
    already_lost: cohort.participants.filter((p) => "_outcome_note" in p).map((p) => p.name),
  };
}

export const participantsById = Object.fromEntries(cohort.participants.map((p) => [p.id, { name: p.name, mentor: p.mentor, location: p.location }]));
export const mentors = cohort.mentors;
