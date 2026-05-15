import { getAuditEvents } from "@/lib/data/ai-brain";
import { AuditWorkspace } from "../_components/audit-workspace";

export default function AIBrainAuditPage() {
  return <AuditWorkspace events={getAuditEvents()} />;
}
