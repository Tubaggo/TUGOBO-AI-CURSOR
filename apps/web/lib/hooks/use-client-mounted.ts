"use client";

import { useEffect, useState } from "react";

/** True only after the client has mounted — use to gate SSR-unsafe UI (Radix, Date.now, live store). */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
