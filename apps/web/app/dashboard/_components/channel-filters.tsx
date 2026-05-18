"use client";

import type { ChannelFilter } from "@/lib/channels/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: ChannelFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "web_chat", label: "Web Chat" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "human_support", label: "İnsan desteği" },
];

export function ChannelFilters({
  value,
  onChange,
}: {
  value: ChannelFilter;
  onChange: (filter: ChannelFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-white/[0.03] px-3 py-2.5">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors duration-200",
            value === f.id
              ? "bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
              : "text-white/32 hover:bg-white/[0.04] hover:text-white/55"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
