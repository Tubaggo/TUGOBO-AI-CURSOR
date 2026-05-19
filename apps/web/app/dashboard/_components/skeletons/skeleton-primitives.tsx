"use client";

import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-white/[0.06] skeleton-shimmer", className)} aria-hidden />;
}
