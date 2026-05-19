"use client";

import { useEffect, useState } from "react";

/**
 * Brief staged loading for panel surfaces — intentional skeleton window, not blocking fetch.
 */
export function usePanelStagedLoad(
  resetKey?: string,
  delayMs = 280
): { isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const t = window.setTimeout(() => setIsLoading(false), delayMs);
    return () => window.clearTimeout(t);
  }, [resetKey, delayMs]);

  return { isLoading };
}
