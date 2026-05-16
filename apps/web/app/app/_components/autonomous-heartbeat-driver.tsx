"use client";

import { useEffect } from "react";
import { useOperationsStore } from "@/store/operations-store";

const MIN_INTERVAL_MS = 52_000;
const MAX_INTERVAL_MS = 78_000;

function nextInterval(): number {
  return MIN_INTERVAL_MS + Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));
}

/** Ambient low-frequency pulses — keeps the operational fabric feeling alive without user action. */
export function AutonomousHeartbeatDriver() {
  const hydrated = useOperationsStore((s) => s.hydrated);
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
      }, nextInterval());
    };

    schedule();
    return () => {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
    };
  }, [hydrated, emitHeartbeat]);

  return null;
}
