"use client";

import type { ConversationThread } from "@/lib/runtime/entities";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type Moment = { id: string; text: string; tone: "blue" | "amber" | "violet" | "rose" | "emerald" };

function buildMoments(thread: ConversationThread): Moment[] {
  const moments: Moment[] = [];

  if (thread.flags.paymentRisk) {
    moments.push({ id: "pay", text: "Tugobo AI is monitoring payment status…", tone: "amber" });
  }
  if (thread.flags.recoveryActive) {
    moments.push({ id: "rec", text: "Alternate payment route being prepared…", tone: "violet" });
  }
  if (thread.flags.vipEscalation) {
    moments.push({ id: "vip", text: "AI recommends human takeover for this guest", tone: "rose" });
  }
  if (thread.flags.humanTakeover) {
    moments.push({ id: "staff", text: "Staff assisting — AI on standby", tone: "rose" });
  }
  if (thread.unread > 0 && !thread.flags.paymentRisk) {
    moments.push({ id: "avail", text: "Tugobo AI is checking availability…", tone: "blue" });
  }
  if (thread.flags.otaConversion) {
    moments.push({ id: "ota", text: "AI preparing direct rate match offer…", tone: "emerald" });
  }
  if (moments.length === 0 && thread.status === "ai_active") {
    moments.push({ id: "active", text: "AI supervising reservation flow", tone: "blue" });
  }
  if (thread.status === "resolved") {
    moments.push({ id: "done", text: "Booking confirmed — AI ready for pre-arrival upsell", tone: "emerald" });
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
  pulseActive,
}: {
  thread: ConversationThread;
  pulseActive?: boolean;
}) {
  const moments = buildMoments(thread);
  if (moments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {moments.map((m) => (
        <div
          key={m.id}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 transition-shadow",
            TONE_CLASS[m.tone],
            pulseActive && m.tone === "amber" && "shadow-[0_0_16px_rgba(251,191,36,0.12)]"
          )}
        >
          <Sparkles
            className={cn("h-3.5 w-3.5 shrink-0 opacity-90", pulseActive && "animate-pulse")}
            aria-hidden
          />
          <p className="text-[11px] font-medium leading-snug">{m.text}</p>
        </div>
      ))}
    </div>
  );
}
