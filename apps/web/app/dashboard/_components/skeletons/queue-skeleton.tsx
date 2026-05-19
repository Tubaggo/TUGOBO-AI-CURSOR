"use client";

import { SkeletonBlock } from "./skeleton-primitives";
import { cn } from "@/lib/utils";

export function QueueSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("animate-panel-fade-in divide-y divide-white/[0.04]", className)} aria-busy aria-label="Yükleniyor">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3.5">
          <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <SkeletonBlock className="h-3.5 w-[42%]" />
              <SkeletonBlock className="h-2.5 w-10" />
            </div>
            <SkeletonBlock className="h-2.5 w-full" />
            <SkeletonBlock className="h-2.5 w-[72%]" />
            <div className="flex gap-2 pt-0.5">
              <SkeletonBlock className="h-4 w-14 rounded-full" />
              <SkeletonBlock className="h-4 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
