"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ConversationSummary } from "@/lib/types/conversations";
import { ConversationListItem } from "./conversation-list-item";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  rows: ConversationSummary[];
  activeId: string | null;
  onSelectConversation?: () => void;
};

export function ConversationList({ rows, activeId, onSelectConversation }: ConversationListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.guestName.toLowerCase().includes(q) ||
        r.lastMessagePreview.toLowerCase().includes(q) ||
        r.status.replace("_", " ").includes(q)
    );
  }, [query, rows]);

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-white/[0.06] bg-zinc-950/80 md:bg-zinc-950/50">
      <div className="shrink-0 border-b border-white/[0.06] p-3 md:p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400/75">
          Operations inbox
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-white/90">Conversations</h2>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guest, intent, status…"
              className="w-full rounded-lg border border-white/[0.08] bg-black/35 py-2 pl-8 pr-3 text-[12px] text-white/85 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/35"
              type="search"
            />
          </div>
          <button
            type="button"
            disabled
            title="Filters — Sprint 3"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/35"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-white/28">Filters placeholder · channel routing next</p>
      </div>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2 md:px-2.5 md:py-2.5">
        {filtered.map((row) => (
          <ConversationListItem
            key={row.id}
            row={row}
            active={row.id === activeId}
            onNavigate={onSelectConversation}
          />
        ))}
        {filtered.length === 0 ? (
          <li className="px-2 py-8 text-center text-xs text-white/35">No threads match this search.</li>
        ) : null}
      </ul>
    </div>
  );
}
