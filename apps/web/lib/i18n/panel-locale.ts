import { defaultLocale, type PanelLocale } from "./config";

/**
 * Resolves locale for hotel operation panels.
 * Turkish is primary for all panel routes (/app, /demo/otel-paneli, /dashboard).
 */
export function resolvePanelLocale(_basePath?: string): PanelLocale {
  return defaultLocale;
}
