"use client";

import { SkeletonBlock } from "./skeleton-primitives";
import { cn } from "@/lib/utils";

export function SummaryCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full space-y-5 p-5 animate-panel-fade-in", className)} aria-busy aria-label="Özet yükleniyor">
      <div className="space-y-2">
        <SkeletonBlock className="h-2 w-20" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-[88%]" />
      </div>
      <div className="space-y-2 border-t border-white/[0.04] pt-4">
        <SkeletonBlock className="h-2 w-24" />
        <SkeletonBlock className="h-6 w-28 rounded-lg" />
        <SkeletonBlock className="h-3 w-full" />
      </div>
      <div className="space-y-2 border-t border-white/[0.04] pt-4">
        <SkeletonBlock className="h-2 w-28" />
        <SkeletonBlock className="h-9 w-full rounded-lg" />
      </div>
      <div className="space-y-2 border-t border-white/[0.04] pt-4">
        <SkeletonBlock className="h-2 w-20" />
        <SkeletonBlock className="h-3 w-32" />
      </div>
    </div>
  );
}
