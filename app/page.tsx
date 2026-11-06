"use client";

import { useState } from "react";
import Journey from "./components/Journey";
import Program from "./components/Program";

export default function Home() {
  const [mode, setMode] = useState<"journey" | "program">("journey");
  // Questions Maya escalates in the journey land in her mentor's inbox.
  const [escalations, setEscalations] = useState<string[]>([]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Momentum</h1>
          <p className="mt-1 max-w-xl text-sm text-neutral-500">
            Keeps women in open-source mentorship programs moving, from first issue to second PR.
          </p>
        </div>
        <div className="flex rounded-lg border border-neutral-200 p-1 text-sm dark:border-neutral-800">
          {(
            [
              ["journey", "Maya's journey"],
              ["program", "Program view"],
            ] as const
          ).map(([id, text]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${mode === id ? "bg-violet-600 text-white" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}
            >
              {text}
            </button>
          ))}
        </div>
      </header>
      {/* Both stay mounted so results survive switching views during the demo. */}
      <div hidden={mode !== "journey"}>
        <Journey onEscalate={(b) => setEscalations((e) => (e.includes(b) ? e : [...e, b]))} />
      </div>
      <div hidden={mode !== "program"}>
        <Program escalations={escalations} />
      </div>
    </main>
  );
}
