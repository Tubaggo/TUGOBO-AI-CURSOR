"use client";

import { cn } from "@/lib/utils";

export type ConversationsMobilePane = "queue" | "chat" | "summary";

const TABS: { id: ConversationsMobilePane; label: string }[] = [
  { id: "queue", label: "Görüşmeler" },
  { id: "chat", label: "Konuşma" },
  { id: "summary", label: "Özet" },
];

export function ConversationsMobileTabs({
  value,
  onChange,
  chatDisabled,
  summaryDisabled,
  alertQueue,
  alertChat,
  alertSummary,
}: {
  value: ConversationsMobilePane;
  onChange: (pane: ConversationsMobilePane) => void;
  chatDisabled?: boolean;
  summaryDisabled?: boolean;
  alertQueue?: boolean;
  alertChat?: boolean;
  alertSummary?: boolean;
}) {
  return (
    <div
      className="shrink-0 border-b border-white/[0.05] bg-zinc-950/80 px-3 py-2 md:hidden"
      role="tablist"
      aria-label="Konuşma görünümü"
    >
      <div className="flex gap-1 rounded-xl bg-white/[0.04] p-1">
        {TABS.map((tab) => {
          const disabled =
            tab.id === "chat" ? chatDisabled : tab.id === "summary" ? summaryDisabled : false;
          const alert =
            tab.id === "queue"
              ? alertQueue
              : tab.id === "chat"
                ? alertChat
                : alertSummary;
          const active = value === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => !disabled && onChange(tab.id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] font-semibold transition-all duration-200",
                active
                  ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-white/38 hover:text-white/55",
                disabled && "cursor-not-allowed opacity-40"
              )}
            >
              {alert ? (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              ) : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
