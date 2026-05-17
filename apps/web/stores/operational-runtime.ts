"use client";

/**
 * Backward-compatible entry for app pages.
 * Canonical store: @/lib/runtime/store/useOperationalStore
 */
export { useOperationalStore as useOperationalRuntime } from "@/lib/runtime/store/useOperationalStore";
export * from "@/lib/runtime/store/selectors";
