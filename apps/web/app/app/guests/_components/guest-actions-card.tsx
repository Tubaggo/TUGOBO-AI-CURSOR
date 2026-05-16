"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { GuestAIAction } from "@/lib/types/guests";
import { useAIRuntimeStore } from "@/lib/runtime";

type GuestActionsCardProps = {
  actions: GuestAIAction[];
  guestId: string;
  conversationId?: string | null;
  reservationId?: string | null;
};

export function GuestActionsCard({
  actions,
  guestId,
  conversationId,
  reservationId,
}: GuestActionsCardProps) {
  const [toast, setToast] = useState<string | null>(null);
  const dispatch = useAIRuntimeStore((s) => s.dispatch);

  function runAction(action: GuestAIAction) {
    const refs = {
      guestId,
      conversationId: conversationId ?? undefined,
      reservationId: reservationId ?? undefined,
    };

    switch (action.kind) {
      case "upgrade":
        dispatch("UPGRADE_OFFERED", refs);
        setToast("Upgrade path propagated · audit + revenue rails updated.");
        break;
      case "direct_booking":
        dispatch("OTA_RECOVERY_TRIGGERED", refs);
        setToast("OTA → direct recovery orchestrated · workflows armed.");
        break;
      case "loyalty":
        dispatch("VIP_GUEST_DETECTED", refs);
        setToast("VIP intelligence tier promoted · concierge routing tightened.");
        break;
      case "human_followup":
        dispatch("HUMAN_TAKEOVER", refs);
        setToast("Human takeover issued · AI paused · staff assignment logged.");
        break;
      case "support_priority":
        dispatch("LOW_CONFIDENCE_QUOTE", { ...refs, confidenceDelta: -0.12 });
        setToast("Support priority lane · confidence gate + escalation opened.");
        break;
      case "risk_flag":
        dispatch("NEGATIVE_SENTIMENT", refs);
        setToast("Risk posture elevated · guest intelligence + escalations synced.");
        break;
      default:
        setToast(`${action.label} queued.`);
    }

    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <section className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <header className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-300/85" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Operational AI actions</h3>
      </header>
      <p className="mb-3 text-[11px] text-white/38">
        Wired to the unified operations fabric — mutations propagate across audit, workflows, and threads.
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
