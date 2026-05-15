import { getAIBrainOverview } from "@/lib/data/ai-brain";
import { AIBrainOverviewWorkspace } from "./_components/ai-brain-overview-workspace";

export default function AIBrainPage() {
  const overview = getAIBrainOverview();
  return <AIBrainOverviewWorkspace overview={overview} />;
}
