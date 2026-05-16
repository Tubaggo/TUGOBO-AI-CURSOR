"use client";

import { useEffect, type ReactNode } from "react";
import { useAIRuntimeStore } from "@/lib/runtime";
import { AutonomousHeartbeatDriver } from "./autonomous-heartbeat-driver";

type RuntimeProviderProps = {
  children: ReactNode;
};

/** Hydrates global AI orchestration store once per app session. */
export function RuntimeProvider({ children }: RuntimeProviderProps) {
  const hydrate = useAIRuntimeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <AutonomousHeartbeatDriver />
      {children}
    </>
  );
}
