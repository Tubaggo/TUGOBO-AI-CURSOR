"use client";

import { useEffect, useState } from "react";
import { useOperationalRuntime, selectMutationPulseAt } from "@/stores/operational-runtime";

export function useMutationPulse(windowMs = 5000): boolean {
  const pulseAt = useOperationalRuntime(selectMutationPulseAt);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (pulseAt === null) {
      setActive(false);
      return;
    }
    const tick = () => setActive(Date.now() - pulseAt < windowMs);
    tick();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [pulseAt, windowMs]);

  return active;
}
