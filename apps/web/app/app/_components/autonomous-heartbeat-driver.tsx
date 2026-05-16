"use client";

import { useEffect } from "react";
import { useOperationsStore } from "@/store/operations-store";
import { DEMO_HEARTBEAT_INTERVAL_MS } from "@/lib/runtime/demo-mode";

const MIN_INTERVAL_MS = 52_000;
const MAX_INTERVAL_MS = 78_000;

function nextInterval(demoStable: boolean): number {
  if (demoStable) return DEMO_HEARTBEAT_INTERVAL_MS;
  return MIN_INTERVAL_MS + Math.floor((MAX_INTERVAL_MS - MIN_INTERVAL_MS) * 0.5);
}

/** Ambient low-frequency pulses — keeps the operational fabric feeling alive without user action. */
export function AutonomousHeartbeatDriver() {
  const hydrated = useOperationsStore((s) => s.hydrated);
  const demoStableMode = useOperationsStore((s) => s.demoStableMode);
  const emitHeartbeat = useOperationsStore((s) => s.emitHeartbeat);

  useEffect(() => {
    if (!hydrated) return;

    let timerId: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      timerId = setTimeout(() => {
        if (document.visibilityState === "visible") {
          emitHeartbeat();
        }
        schedule();
      }, nextInterval(demoStableMode));
    };

    schedule();
    return () => {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
    };
  }, [hydrated, demoStableMode, emitHeartbeat]);

  return null;
}
