/** Demo-stable runtime — deterministic pulses, no random hydration noise. */

export const DEMO_HEARTBEAT_INTERVAL_MS = 64_000;

export const DEMO_EVENT_SEQUENCE: Array<{
  delayMs: number;
  type: "heartbeat" | "focus";
  focusLabel?: string;
}> = [
  { delayMs: 0, type: "focus", focusLabel: "Monitoring operational signals" },
  { delayMs: 64_000, type: "heartbeat" },
  { delayMs: 128_000, type: "heartbeat" },
  { delayMs: 192_000, type: "heartbeat" },
];

let demoSequenceCursor = 0;

export function nextDemoSequenceIndex(): number {
  const idx = demoSequenceCursor % DEMO_EVENT_SEQUENCE.length;
  demoSequenceCursor += 1;
  return idx;
}

export function resetDemoSequence(): void {
  demoSequenceCursor = 0;
}
