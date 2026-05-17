"use client";

import { useEffect } from "react";
import { startOperationalSimulation } from "@/lib/runtime/simulations/engine";
import { useOperationalStore } from "@/lib/runtime/store/useOperationalStore";

/** Enables live operational events after client mount (hydration-safe). */
export function OperationalMount({ children }: { children: React.ReactNode }) {
  const setMounted = useOperationalStore((s) => s.setMounted);
  const pulseLiveMetrics = useOperationalStore((s) => s.pulseLiveMetrics);
  const dispatch = useOperationalStore((s) => s.dispatch);

  useEffect(() => {
    setMounted(true);

    const metricsInterval = window.setInterval(() => {
      pulseLiveMetrics();
    }, 45_000);

    const simulation = startOperationalSimulation((type) => {
      dispatch(type);
    });

    return () => {
      setMounted(false);
      window.clearInterval(metricsInterval);
      simulation.stop();
    };
  }, [setMounted, pulseLiveMetrics, dispatch]);

  return <>{children}</>;
}
