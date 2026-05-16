"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { useOperationsStore } from "@/store/operations-store";
import { deriveStaffWorkload } from "@/lib/runtime/staff-roster";

const AVAILABILITY_TONE: Record<string, string> = {
  available: "text-emerald-300/85",
  focused: "text-amber-200/85",
  at_capacity: "text-rose-300/85",
  offline: "text-white/30",
};

const LOAD_TONE: Record<string, string> = {
  low: "border-emerald-500/25 text-emerald-200/80",
  medium: "border-amber-500/25 text-amber-200/80",
  high: "border-rose-500/35 text-rose-200/85",
};

type StaffWorkloadPanelProps = {
  compact?: boolean;
  className?: string;
};

export function StaffWorkloadPanel({ compact = false, className }: StaffWorkloadPanelProps) {
  const mounted = useClientMounted();
  const snapshot = useOperationsStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      staffAssignments: s.staffAssignments,
      escalations: s.escalations,
      notifications: s.notifications,
    }))
  );

  const roster = useMemo(() => {
    if (!snapshot.hydrated) return [];
    return deriveStaffWorkload(snapshot);
  }, [snapshot]);

  if (!mounted || !snapshot.hydrated) return null;

  return (
    <section className={cn(className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
        Staff workload
      </p>
      {!compact ? (
        <p className="mt-0.5 text-[10px] text-white/28">
          Assignments, escalations owned, and response load
        </p>
      ) : null}
      <ul className={cn("space-y-2", compact ? "mt-2" : "mt-3")}>
        {roster.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-white/[0.07] bg-black/25 px-2.5 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white/88">{s.name}</p>
                <p className="text-[10px] text-white/38">{s.desk}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  LOAD_TONE[s.responseLoad]
                )}
              >
                {s.responseLoad}
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-white/42">{s.currentFocus}</p>
            <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] tabular-nums text-white/35">
              <span>{s.activeAssignments} assignments</span>
              <span>{s.escalationsOwned} escalations</span>
              <span className={AVAILABILITY_TONE[s.availability]}>{s.availability.replace("_", " ")}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
