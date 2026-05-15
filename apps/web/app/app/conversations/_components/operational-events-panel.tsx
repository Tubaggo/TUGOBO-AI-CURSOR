"use client";

import { useState } from "react";
import { Activity, CheckCircle2, CreditCard, Frown, Loader2, Plane, Sparkles, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIRuntimeStore } from "@/lib/runtime";
import type { Conversation } from "@/lib/types/conversations";

type OperationalEventsPanelProps = {
  detail: Conversation;
};

export function OperationalEventsPanel({ detail }: OperationalEventsPanelProps) {
  const dispatch = useAIRuntimeStore((s) => s.dispatch);
  const [flash, setFlash] = useState<string | null>(null);

  const base = {
    conversationId: detail.id,
    reservationId: detail.reservationId ?? undefined,
    guestId: detail.guestId,
  };

  function fire(label: string, type: Parameters<typeof dispatch>[0]) {
    dispatch(type, base);
    setFlash(label);
    window.setTimeout(() => setFlash(null), 2400);
  }

  const triggers = [
    {
      label: "Payment failed",
      icon: CreditCard,
      tone: "border-orange-500/25 bg-orange-500/[0.07] text-orange-100/95",
      onClick: () => fire("Payment failed", "PAYMENT_LINK_FAILED"),
    },
    {
      label: "Payment success",
      icon: CheckCircle2,
      tone: "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-100/95",
      onClick: () => fire("Payment success", "PAYMENT_COMPLETED"),
    },
    {
      label: "Negative sentiment",
      icon: Frown,
      tone: "border-rose-500/25 bg-rose-500/[0.07] text-rose-100/95",
      onClick: () => fire("Negative sentiment", "NEGATIVE_SENTIMENT"),
    },
    {
      label: "Low confidence",
      icon: Activity,
      tone: "border-violet-500/25 bg-violet-500/[0.07] text-violet-100/95",
      onClick: () => fire("Low confidence", "LOW_CONFIDENCE_QUOTE"),
    },
    {
      label: "VIP detected",
      icon: Sparkles,
      tone: "border-cyan-500/25 bg-cyan-500/[0.07] text-cyan-100/95",
      onClick: () => fire("VIP flow", "VIP_GUEST_DETECTED"),
    },
    {
      label: "OTA recovery",
      icon: Activity,
      tone: "border-violet-500/20 bg-violet-500/[0.06] text-violet-100/90",
      onClick: () => fire("OTA recovery", "OTA_RECOVERY_TRIGGERED"),
    },
    {
      label: "Human takeover",
      icon: UserCog,
      tone: "border-amber-500/25 bg-amber-500/[0.07] text-amber-100/95",
      onClick: () => fire("Human takeover", "HUMAN_TAKEOVER"),
    },
    {
      label: "Transfer delay",
      icon: Plane,
      tone: "border-white/[0.08] bg-white/[0.04] text-white/70",
      onClick: () => fire("Transfer risk", "TRANSFER_DELAY_RISK"),
    },
  ] as const;

  return (
    <section className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300/75">
        Live orchestration
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-white/38">
        Simulate operational events — propagates to reservations, guests, AI Brain, escalations, and
        audit in real time.
      </p>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {triggers.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.onClick}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[10px] font-semibold transition hover:brightness-110",
              t.tone
            )}
          >
            <t.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>
      {flash ? (
        <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-cyan-200/90 animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          Propagated: {flash} across operational layer
        </p>
      ) : null}
    </section>
  );
}
