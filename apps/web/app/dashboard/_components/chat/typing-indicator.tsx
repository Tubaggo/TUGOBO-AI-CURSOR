"use client";

import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { op, type OperationalTextKey } from "@/lib/i18n/operationalTexts";
import type { PanelLocale } from "@/lib/i18n/config";

export type AiTypingPhase =
  | "thinking"
  | "composing"
  | "checking_availability"
  | "checking_payment"
  | "preparing_reservation";

const PHASE_TEXT_KEY: Record<AiTypingPhase, OperationalTextKey> = {
  thinking: "aiTypingThinking",
  composing: "aiTypingComposing",
  checking_availability: "aiTypingCheckingAvailability",
  checking_payment: "aiTypingCheckingPayment",
  preparing_reservation: "aiTypingPreparingReservation",
};

export function ChatTypingIndicator({
  phase = "composing",
  locale = "tr",
}: {
  phase?: AiTypingPhase;
  locale?: PanelLocale;
}) {
  const label = op(PHASE_TEXT_KEY[phase], locale);

  return (
    <div className={cn("mt-5 flex animate-msg-in items-end gap-2.5")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          "border border-blue-400/20 bg-blue-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        )}
      >
        <Bot className="h-3.5 w-3.5 text-blue-300/90" aria-hidden />
      </div>
      <div
        className={cn(
          "animate-typing-breathe max-w-[min(100%,22rem)] rounded-2xl rounded-bl-md",
          "border border-blue-400/14 bg-blue-600/[0.18]",
          "px-3.5 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-[5px] pt-0.5" aria-hidden>
            <span className="h-[5px] w-[5px] rounded-full bg-blue-200/90 animate-typing-dot [animation-delay:0ms]" />
            <span className="h-[5px] w-[5px] rounded-full bg-blue-200/90 animate-typing-dot [animation-delay:180ms]" />
            <span className="h-[5px] w-[5px] rounded-full bg-blue-200/90 animate-typing-dot [animation-delay:360ms]" />
          </div>
          <span className="h-3 w-px shrink-0 bg-white/10" aria-hidden />
          <span className="truncate text-[11px] font-medium tracking-wide text-blue-100/70">{label}</span>
        </div>
      </div>
    </div>
  );
}
