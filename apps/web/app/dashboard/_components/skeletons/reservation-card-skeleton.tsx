"use client";

import { SkeletonBlock } from "./skeleton-primitives";
import { cn } from "@/lib/utils";

export function ReservationCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-zinc-900/80 p-4 animate-panel-fade-in",
        className
      )}
      aria-busy
      aria-label="Rezervasyon kartı yükleniyor"
    >
      <div className="mb-3 flex items-center justify-between">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-10 rounded-lg" />
        <SkeletonBlock className="h-10 rounded-lg" />
        <SkeletonBlock className="h-10 rounded-lg" />
        <SkeletonBlock className="h-10 rounded-lg" />
      </div>
      <SkeletonBlock className="mt-4 h-9 w-full rounded-lg" />
    </div>
  );
}
