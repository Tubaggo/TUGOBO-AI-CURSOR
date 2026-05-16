"use client";

import { LiveOperationalEventFeed } from "./live-operational-event-feed";
import { ExecutiveSignalStrip } from "./executive-signal-strip";

/** Client layer for overview — executive signals + unified live stream. */
export function OverviewLiveLayer() {
  return (
    <div className="mt-8 space-y-6">
      <ExecutiveSignalStrip />
      <LiveOperationalEventFeed
        limit={7}
        title="Operational fabric"
        subtitle="Autonomous pulses · cross-module propagation"
      />
    </div>
  );
}
