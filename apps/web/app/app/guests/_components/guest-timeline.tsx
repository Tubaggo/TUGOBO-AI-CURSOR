"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpCircle,
  Banknote,
  Bot,
  Calendar,
  MessageSquare,
  NotebookPen,
  RotateCcw,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuestTimelineEvent, GuestTimelineEventType } from "@/lib/types/guests";

type GuestTimelineProps = {
  events: GuestTimelineEvent[];
  onAddNote?: (body: string) => void;
};

function eventIcon(type: GuestTimelineEventType) {
  switch (type) {
    case "conversation":
      return MessageSquare;
    case "reservation":
      return Calendar;
    case "payment":
      return Banknote;
    case "upgrade":
      return ArrowUpCircle;
    case "complaint":
      return AlertCircle;
    case "ai_escalation":
      return Bot;
    case "check_in":
      return User;
    case "special_request":
      return NotebookPen;
    case "recovery":
      return RotateCcw;
    default:
      return NotebookPen;
  }
}

function eventTone(type: GuestTimelineEventType): string {
  switch (type) {
    case "complaint":
    case "ai_escalation":
      return "border-rose-500/25 bg-rose-500/10 text-rose-200";
    case "recovery":
    case "upgrade":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
    case "payment":
      return "border-amber-500/25 bg-amber-500/10 text-amber-200";
    default:
      return "border-white/[0.08] bg-white/[0.04] text-white/55";
  }
}

export function GuestTimeline({ events, onAddNote }: GuestTimelineProps) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-zinc-900/40 p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Operational timeline</h2>
          <p className="mt-0.5 text-xs text-white/40">
            Unified memory — conversations, reservations, payments, recovery
          </p>
        </div>
        {onAddNote ? (
          <AddNoteForm onSubmit={onAddNote} />
        ) : null}
      </div>
      <ul className="relative space-y-0 border-l border-white/[0.08] pl-5">
        {events.map((evt) => {
          const Icon = eventIcon(evt.type);
          return (
            <li key={evt.id} className="relative pb-6 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[25px] flex h-5 w-5 items-center justify-center rounded-full border",
                  eventTone(evt.type)
                )}
              >
                <Icon className="h-2.5 w-2.5" aria-hidden />
              </span>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-[13px] leading-snug text-white/85">{evt.description}</p>
                <time className="shrink-0 text-[10px] tabular-nums text-white/35">
                  {new Date(evt.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-white/35">
                <span className="uppercase tracking-wide">{evt.type.replace(/_/g, " ")}</span>
                <span>·</span>
                <span>{evt.actorType}</span>
                {evt.conversationId ? (
                  <Link
                    href={`/app/conversations/${evt.conversationId}`}
                    className="font-semibold text-violet-300/90 hover:text-violet-200"
                  >
                    Open conversation
                  </Link>
                ) : null}
                {evt.reservationId ? (
                  <Link
                    href={`/app/reservations/${evt.reservationId}`}
                    className="font-semibold text-blue-300/90 hover:text-blue-200"
                  >
                    Open reservation
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddNoteForm({ onSubmit }: { onSubmit: (body: string) => void }) {
  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const body = String(fd.get("note") ?? "").trim();
        if (!body) return;
        onSubmit(body);
        e.currentTarget.reset();
      }}
    >
      <input
        name="note"
        type="text"
        placeholder="Add operational note…"
        className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2 text-[12px] text-white placeholder:text-white/30 focus:border-violet-500/40 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg border border-violet-500/35 bg-violet-500/15 px-3 py-2 text-[12px] font-semibold text-white hover:bg-violet-500/25"
      >
        Save
      </button>
    </form>
  );
}
