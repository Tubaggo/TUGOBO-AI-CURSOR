import { getAIActions } from "@/lib/data/ai-brain";
import { ActionsWorkspace } from "../_components/actions-workspace";

export default function AIBrainActionsPage() {
  return <ActionsWorkspace initialActions={getAIActions()} />;
}
