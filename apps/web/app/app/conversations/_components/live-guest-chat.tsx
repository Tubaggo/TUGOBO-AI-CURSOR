"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Globe,
  Instagram,
  MessageCircle,
  Phone,
  Send,
  UserCheck,
  Clock,
} from "lucide-react";
import type { ChatMsg, ConvReservation } from "@/app/dashboard/_components/chat-threads";
import type { Conversation, ConversationChannel, ConversationStatus } from "@/app/dashboard/_components/mock-data";
import { MessageRow, ChatTypingIndicator } from "@/app/dashboard/_components/chat";
import { LanguageFlag, StatusBadge } from "@/app/dashboard/_components/badges";
import type { ConversationThread } from "@/lib/runtime/entities";
import { cn } from "@/lib/utils";
import { ReservationOperationCard } from "./reservation-operation-card";
import { AiOperationalMoments } from "./ai-operational-moments";
import { op } from "@/lib/i18n/operationalTexts";

function channelLabel(ch?: ConversationChannel): string {
  if (ch === "instagram") return "Instagram";
  if (ch === "web") return "Web chat";
  return "WhatsApp";
}

function ChannelGlyph({ channel, className }: { channel?: ConversationChannel; className?: string }) {
  const ch = channel ?? "whatsapp";
  if (ch === "instagram") return <Instagram className={cn("text-pink-400/90", className)} aria-hidden />;
  if (ch === "web") return <Globe className={cn("text-sky-400/85", className)} aria-hidden />;
  return <MessageCircle className={cn("text-emerald-400/90", className)} aria-hidden />;
}

export function LiveGuestChat({
  conv,
  thread,
  messages,
  reservation,
  isAiTyping = false,
  effectiveStatus,
  pulseActive,
  onTakeover,
  onHandToAI,
}: {
  conv: Conversation;
  thread: ConversationThread;
  messages: ChatMsg[];
  reservation?: ConvReservation;
  isAiTyping?: boolean;
  effectiveStatus: ConversationStatus;
  pulseActive?: boolean;
  onTakeover: () => void;
  onHandToAI: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sentLink, setSentLink] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMsg[]>([]);

  const allMessages = [...messages, ...localMessages];
  const reservationsHref = "/app/reservations";

  useEffect(() => {
    setSentLink(false);
    setReplyText("");
    setLocalMessages([]);
  }, [conv.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [allMessages, isAiTyping, reservation]);

  function handleSendReply() {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setLocalMessages((prev) => [
      ...prev,
      { id: `staff-${Date.now()}`, dir: "out", by: "human", body: trimmed, time: now },
    ]);
    setReplyText("");
  }

  function handleSendPaymentLink() {
    setSentLink(true);
    setTimeout(() => setSentLink(false), 3500);
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-white/[0.03] bg-zinc-950/15">
      <div className="shrink-0 border-b border-white/[0.03] bg-zinc-950/40 px-6 py-4 backdrop-blur-[6px]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white ring-1 ring-white/[0.06]",
                  conv.contact.avatarColor
                )}
              >
                {conv.contact.initials}
              </div>
              <span className="pointer-events-none absolute bottom-0 left-0 z-[1] flex h-[15px] w-[15px] translate-x-[-2px] translate-y-[3px] items-center justify-center rounded-md border border-white/[0.1] bg-zinc-950/95">
                <ChannelGlyph channel={conv.channel} className="h-2 w-2" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">{conv.contact.name}</span>
                <LanguageFlag lang={conv.language} />
                <StatusBadge status={effectiveStatus} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/36">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 opacity-70" />
                  {conv.contact.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 opacity-70" />
                  {allMessages.filter((m) => m.dir !== "system").length} messages
                </span>
                <span className="hidden items-center gap-1 sm:flex">
                  <ChannelGlyph channel={conv.channel} className="h-3 w-3" />
                  {channelLabel(conv.channel)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {effectiveStatus === "ai_active" ? (
              <button
                type="button"
                onClick={onTakeover}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/18 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-400 transition-colors hover:bg-amber-500/14"
              >
                <UserCheck className="h-3.5 w-3.5" />
                {op("takeOver")}
              </button>
            ) : null}
            {effectiveStatus === "human_takeover" ? (
              <button
                type="button"
                onClick={onHandToAI}
                className="flex items-center gap-1.5 rounded-lg border border-blue-500/18 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-400 transition-colors hover:bg-blue-500/14"
              >
                <Bot className="h-3.5 w-3.5" />
                Hand to AI
              </button>
            ) : null}
            {reservation ? (
              <Link
                href={reservationsHref}
                className="hidden rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[11px] font-medium text-white/48 transition-colors hover:text-white/75 lg:flex"
              >
                {op("viewBooking")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-3">
          <AiOperationalMoments thread={thread} pulseActive={pulseActive} />
        </div>
      </div>

      <div ref={scrollRef} className="conv-scroll min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-[min(100%,30.5rem)]">
          <div className="mb-6 flex justify-center">
            <span className="rounded-full border border-white/[0.045] bg-white/[0.025] px-4 py-1.5 text-[11px] font-medium text-white/32">
              Live guest operation
            </span>
          </div>
          {allMessages.map((msg, i) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              conv={conv}
              prevMsg={i > 0 ? allMessages[i - 1] : undefined}
            />
          ))}
          {isAiTyping ? (
            <div className="pt-4">
              <ChatTypingIndicator />
            </div>
          ) : null}
          {reservation ? (
            <div className="pt-6">
              <ReservationOperationCard
                reservation={reservation}
                convStatus={effectiveStatus}
                sentLink={sentLink}
                onSendPaymentLink={handleSendPaymentLink}
                reservationsHref={reservationsHref}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/[0.04] bg-zinc-950/60 px-5 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[min(100%,30.5rem)] gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendReply()}
            placeholder={
              effectiveStatus === "human_takeover"
                ? op("replyAsStaffPlaceholder")
                : op("aiHandlingCannotReply")
            }
            disabled={effectiveStatus === "ai_active"}
            className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:border-blue-500/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSendReply}
            disabled={effectiveStatus === "ai_active" || !replyText.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/15 text-blue-300 transition-colors hover:bg-blue-500/22 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
