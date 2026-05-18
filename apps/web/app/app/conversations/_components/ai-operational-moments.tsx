"use client";

import type { ConversationThread } from "@/lib/runtime/entities";
import { op } from "@/lib/i18n/operationalTexts";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type Moment = { id: string; text: string; tone: "blue" | "amber" | "violet" | "rose" | "emerald" };

function buildMoments(thread: ConversationThread): Moment[] {
  const moments: Moment[] = [];

  if (thread.flags.paymentRisk) {
    moments.push({ id: "pay", text: op("momentPaymentMonitor"), tone: "amber" });
  }
  if (thread.flags.recoveryActive) {
    moments.push({ id: "rec", text: op("momentRecoveryPrep"), tone: "violet" });
  }
  if (thread.flags.vipEscalation) {
    moments.push({ id: "vip", text: op("momentVipEscalation"), tone: "rose" });
  }
  if (thread.flags.humanTakeover) {
    moments.push({ id: "staff", text: op("momentStaffAssist"), tone: "rose" });
  }
  if (thread.unread > 0 && !thread.flags.paymentRisk) {
    moments.push({ id: "avail", text: op("momentCheckingAvail"), tone: "blue" });
  }
  if (thread.flags.otaConversion) {
    moments.push({ id: "ota", text: op("momentOtaOffer"), tone: "emerald" });
  }
  if (moments.length === 0 && thread.status === "ai_active") {
    moments.push({ id: "active", text: op("momentAiSupervising"), tone: "blue" });
  }
  if (thread.status === "resolved") {
    moments.push({ id: "done", text: op("momentBookingDone"), tone: "emerald" });
  }

  return moments.slice(0, 2);
}

const TONE_CLASS: Record<Moment["tone"], string> = {
  blue: "border-blue-500/18 bg-blue-500/[0.06] text-blue-200/85",
  amber: "border-amber-500/22 bg-amber-500/[0.08] text-amber-200/90",
  violet: "border-violet-500/18 bg-violet-500/[0.07] text-violet-200/85",
  rose: "border-rose-500/20 bg-rose-500/[0.07] text-rose-200/88",
  emerald: "border-emerald-500/18 bg-emerald-500/[0.06] text-emerald-200/85",
};

export function AiOperationalMoments({
  thread,
  pulseActive: _pulseActive,
}: {
  thread: ConversationThread;
  pulseActive?: boolean;
}) {
  const moments = buildMoments(thread);
  if (moments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-1 pb-2">
      {moments.map((m) => (
        <span
          key={m.id}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
            TONE_CLASS[m.tone]
          )}
        >
          <Sparkles className="h-2.5 w-2.5 shrink-0 opacity-80" />
          {m.text}
        </span>
      ))}
    </div>
  );
}
