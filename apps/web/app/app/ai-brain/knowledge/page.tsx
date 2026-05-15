import { getKnowledgeEntries } from "@/lib/data/ai-brain";
import { KnowledgeWorkspace } from "../_components/knowledge-workspace";

export default function AIBrainKnowledgePage() {
  return <KnowledgeWorkspace entries={getKnowledgeEntries()} />;
}
