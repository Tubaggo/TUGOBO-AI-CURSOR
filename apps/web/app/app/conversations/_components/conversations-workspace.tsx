"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LayoutGrid, MessageSquare, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, ConversationSummary } from "@/lib/types/conversations";
import { ConversationList } from "./conversation-list";
import { ConversationThread, EmptyThread } from "./conversation-thread";
import { GuestSidebar } from "./guest-sidebar";

type MobilePanel = "list" | "thread" | "sidebar";

type ConversationsWorkspaceProps = {
  summaries: ConversationSummary[];
  activeId: string | null;
  detail: Conversation | null;
};

export function ConversationsWorkspace({ summaries, activeId, detail }: ConversationsWorkspaceProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("list");

  useEffect(() => {
    if (!detail) {
      setMobilePanel("list");
      return;
    }
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setMobilePanel("thread");
    }
  }, [detail?.id]);

  const showList = mobilePanel === "list";
  const showThread = mobilePanel === "thread";
  const showSidebar = mobilePanel === "sidebar";

  const openThread = useCallback(() => setMobilePanel("thread"), []);
  const openList = useCallback(() => setMobilePanel("list"), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mobile chrome */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] bg-zinc-950/95 px-2 py-2 md:hidden">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobilePanel("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide",
              showList ? "bg-white/[0.08] text-white" : "text-white/45"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Inbox
          </button>
          <button
            type="button"
            onClick={() => (detail ? setMobilePanel("thread") : null)}
            disabled={!detail}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide",
              showThread ? "bg-white/[0.08] text-white" : "text-white/45",
              !detail && "opacity-35"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Thread
          </button>
          <button
            type="button"
            onClick={() => (detail ? setMobilePanel("sidebar") : null)}
            disabled={!detail}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide",
              showSidebar ? "bg-white/[0.08] text-white" : "text-white/45",
              !detail && "opacity-35"
            )}
          >
            <PanelRight className="h-3.5 w-3.5" />
            Ops
          </button>
        </div>
        {detail && showThread ? (
          <button
            type="button"
            onClick={openList}
            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] px-2 py-1 text-[11px] font-medium text-white/60"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        ) : null}
      </div>

      <div className="relative grid min-h-0 flex-1 md:grid-cols-[minmax(260px,320px)_1fr] lg:grid-cols-[minmax(260px,300px)_1fr_minmax(280px,340px)]">
        <div className={cn("min-h-0 overflow-hidden md:block", showList ? "block" : "hidden")}>
          <ConversationList rows={summaries} activeId={activeId} onSelectConversation={openThread} />
        </div>

        <div
          className={cn(
            "min-h-0 overflow-hidden md:block",
            showThread ? "flex min-h-0 flex-col" : "hidden min-h-0 md:flex md:flex-col"
          )}
        >
          {detail ? <ConversationThread detail={detail} /> : <EmptyThread />}
        </div>

        <div className="relative hidden min-h-0 lg:block">
          {detail ? (
            <GuestSidebar detail={detail} />
          ) : (
            <aside className="flex h-full min-h-0 flex-col border-l border-white/[0.06] bg-zinc-950/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                AI operations rail
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/38">
                Select a thread to load guest profile, reservation economics, AI confidence, and suggested
                actions — this rail is the orchestration surface for Tugobo.
              </p>
            </aside>
          )}
        </div>
      </div>

      {detail && showSidebar ? (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[1px] lg:hidden"
          role="presentation"
          onClick={() => setMobilePanel("thread")}
        >
          <div
            className="absolute right-0 top-0 flex h-full w-[min(100%,380px)] max-w-full border-l border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/60"
            role="dialog"
            aria-label="Operations sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <GuestSidebar detail={detail} />
          </div>
        </div>
      ) : null}

      {detail ? (
        <button
          type="button"
          onClick={() => setMobilePanel("sidebar")}
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-blue-500/35 bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-blue-50 shadow-lg shadow-black/40 lg:hidden"
        >
          <PanelRight className="h-4 w-4" />
          Ops rail
        </button>
      ) : null}
    </div>
  );
}
