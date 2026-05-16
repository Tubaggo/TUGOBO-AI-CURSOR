"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function formatRelative(iso: string, nowMs: number): string {
  const ms = nowMs - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type RelativeTimeProps = {
  iso: string;
  className?: string;
  /** Stable placeholder during SSR / pre-mount (must match server output). */
  placeholder?: string;
};

/** Relative timestamps — computed only after mount to avoid hydration mismatch. */
export function RelativeTime({
  iso,
  className,
  placeholder = "—",
}: RelativeTimeProps) {
  const [label, setLabel] = useState(placeholder);

  useEffect(() => {
    const tick = () => setLabel(formatRelative(iso, Date.now()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [iso]);

  return (
    <time className={cn(className)} dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
