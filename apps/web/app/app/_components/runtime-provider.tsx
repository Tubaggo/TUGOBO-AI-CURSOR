"use client";

import { useEffect, type ReactNode } from "react";
import { useAIRuntimeStore } from "@/lib/runtime";

type RuntimeProviderProps = {
  children: ReactNode;
};

/** Hydrates global AI orchestration store once per app session. */
export function RuntimeProvider({ children }: RuntimeProviderProps) {
  const hydrate = useAIRuntimeStore((s) => s.hydrate);
  const hydrated = useAIRuntimeStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <div data-runtime-hydrated={hydrated ? "true" : "false"}>{children}</div>;
}
