import type { AuditEvent } from "@/lib/types/ai-brain";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { AuditTimeline } from "./audit-timeline";

type AuditWorkspaceProps = {
  events: AuditEvent[];
};

export function AuditWorkspace({ events }: AuditWorkspaceProps) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <AIBrainPageHeader
        eyebrow="AI Brain · Audit"
        title="AI operational trace system"
        description="Decisions, policy references, action traces, overrides, and knowledge grounding — explainable history for trust and compliance."
      />
      <AuditTimeline events={events} />
    </div>
  );
}
