"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { GuestAIAction } from "@/lib/types/guests";

type GuestActionsCardProps = {
  actions: GuestAIAction[];
};

export function GuestActionsCard({ actions }: GuestActionsCardProps) {
  const [toast, setToast] = useState<string | null>(null);

  function runAction(action: GuestAIAction) {
    setToast(`${action.label} queued (mock tool).`);
    window.setTimeout(() => setToast(null), 2800);
  }

  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <header className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-300/85" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Operational AI actions</h3>
      </header>
      <p className="mb-3 text-[11px] text-white/38">
        Structured like future agent tools — no side effects in mock mode.
      </p>
      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => runAction(action)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:border-violet-500/30 hover:bg-violet-500/10"
            >
              <p className="text-[12px] font-semibold text-white/85">{action.label}</p>
              <p className="mt-0.5 text-[11px] text-white/40">{action.description}</p>
            </button>
          </li>
        ))}
      </ul>
      {toast ? (
        <p className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1.5 text-[11px] font-medium text-emerald-100">
          {toast}
        </p>
      ) : null}
    </section>
  );
}
