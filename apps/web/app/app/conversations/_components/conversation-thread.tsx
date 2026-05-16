"use client";

import { Bot, Shield, User } from "lucide-react";
import { useRuntimeEntityStatuses } from "@/lib/runtime";
import { RuntimeStatusBadgeGroup } from "@/app/app/_components/runtime-status-badge";
import { cn } from "@/lib/utils";
import type { AiHandlingState, Conversation, ConversationStatus } from "@/lib/types/conversations";
import { MessageBubble } from "./message-bubble";
import { ReplyComposer } from "./reply-composer";

const STATUS_LABEL: Record<ConversationStatus, string> = {
  ai_handling: "AI handling",
  human_takeover: "Human takeover",
  awaiting_payment: "Awaiting payment",
  reservation_pending: "Reservation pending",
  escalated: "Escalated",
};

const AI_STATE_LABEL: Record<AiHandlingState, string> = {
  ai_active: "AI replying",
  human_active: "Human in control",
  paused: "AI paused",
};

function TypingIndicatorPlaceholder() {
  return (
    <div className="flex items-center gap-2 px-1 py-2 text-[11px] text-white/35">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/25 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/25 [animation-delay:300ms]" />
      </span>
      <span>Guest may be typing · channel latency ~1s</span>
    </div>
  );
}

type ConversationThreadProps = {
  detail: Conversation;
};

export function ConversationThread({ detail }: ConversationThreadProps) {
  const runtimeStatuses = useRuntimeEntityStatuses(detail.id);
  const escalation = detail.status === "escalated" || detail.escalationFlag;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-gradient-to-b from-zinc-950 to-zinc-950/98">
      <header className="shrink-0 border-b border-white/[0.07] px-3 py-3 transition-colors duration-500 md:px-5 md:py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32">
              Active thread
            </p>
            <h2 className="text-base font-semibold text-white/92">{detail.guest.name}</h2>
            <p className="mt-0.5 text-[11px] text-white/38">
              {detail.guest.language} · {detail.guest.nationality}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                detail.aiState === "ai_active" && "border-blue-500/30 bg-blue-500/10 text-blue-200/90",
                detail.aiState === "human_active" && "border-amber-500/30 bg-amber-500/10 text-amber-200/90",
                detail.aiState === "paused" && "border-white/[0.1] bg-white/[0.04] text-white/45"
              )}
            >
              <Bot className="h-3 w-3" aria-hidden />
              {AI_STATE_LABEL[detail.aiState]}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
              <Shield className="h-3 w-3 opacity-70" aria-hidden />
              {STATUS_LABEL[detail.status]}
            </span>
            {escalation ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/35 bg-rose-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200/95">
                Escalation
              </span>
            ) : null}
            <RuntimeStatusBadgeGroup statuses={runtimeStatuses} max={3} />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {detail.messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          <TypingIndicatorPlaceholder />
        </div>
      </div>

      <ReplyComposer conversationId={detail.id} />
    </div>
  );
}

export function EmptyThread() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-zinc-950/50 px-6 text-center">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-8 shadow-inner shadow-black/30">
        <User className="mx-auto h-8 w-8 text-white/20" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-white/75">Select an operational thread</p>
        <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-white/38">
          Revenue, arrivals, and AI handoffs surface here — pick a conversation from the left rail to
          load guest context and triage.
        </p>
      </div>
    </div>
  );
}
