"use client";

import { SkeletonBlock } from "./skeleton-primitives";
import { cn } from "@/lib/utils";

export function OperationsFeedSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("divide-y divide-white/[0.03] animate-panel-fade-in", className)} aria-busy aria-label="Operasyon akışı yükleniyor">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 border-l-2 border-white/[0.06] px-4 py-3">
          <SkeletonBlock className="mt-0.5 h-4 w-4 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-2 w-12" />
            <SkeletonBlock className="h-3.5 w-[70%]" />
            <SkeletonBlock className="h-2.5 w-[90%]" />
            <SkeletonBlock className="h-2 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
