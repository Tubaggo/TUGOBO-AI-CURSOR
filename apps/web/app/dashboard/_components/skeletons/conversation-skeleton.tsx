"use client";

import { SkeletonBlock } from "./skeleton-primitives";
import { cn } from "@/lib/utils";

export function ConversationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col animate-panel-fade-in", className)} aria-busy aria-label="Görüşme yükleniyor">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
        <SkeletonBlock className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3.5 w-32" />
          <SkeletonBlock className="h-2.5 w-24" />
        </div>
        <SkeletonBlock className="h-7 w-20 rounded-lg" />
      </div>
      <div className="flex-1 space-y-5 overflow-hidden p-5">
        <div className="flex justify-end">
          <SkeletonBlock className="h-12 w-[58%] max-w-xs rounded-2xl rounded-br-md" />
        </div>
        <div className="flex gap-2.5">
          <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
          <SkeletonBlock className="h-14 w-[65%] max-w-sm rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <SkeletonBlock className="h-10 w-[48%] max-w-[220px] rounded-2xl rounded-br-md" />
        </div>
        <div className="flex gap-2.5">
          <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
          <SkeletonBlock className="h-20 w-[72%] max-w-md rounded-2xl rounded-bl-md" />
        </div>
      </div>
      <div className="shrink-0 border-t border-white/[0.06] p-4">
        <SkeletonBlock className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
