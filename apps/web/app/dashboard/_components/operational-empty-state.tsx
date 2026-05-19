"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function OperationalEmptyState({
  icon: Icon,
  title,
  description,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-panel-fade-in",
        compact ? "px-4 py-10" : "px-6 py-14",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center justify-center rounded-2xl border border-white/[0.06]",
          "bg-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
          compact ? "h-11 w-11" : "h-14 w-14"
        )}
      >
        <Icon className={cn("text-white/25", compact ? "h-5 w-5" : "h-6 w-6")} aria-hidden />
      </div>
      <p className={cn("font-medium text-white/55", compact ? "text-sm" : "text-[15px]")}>{title}</p>
      <p
        className={cn(
          "mt-2 max-w-[280px] leading-relaxed text-white/28",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        {description}
      </p>
    </div>
  );
}
