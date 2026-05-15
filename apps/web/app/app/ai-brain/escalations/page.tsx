import { getEscalations } from "@/lib/data/ai-brain";
import { EscalationsWorkspace } from "../_components/escalations-workspace";

export default function AIBrainEscalationsPage() {
  return <EscalationsWorkspace all={getEscalations("all")} />;
}
