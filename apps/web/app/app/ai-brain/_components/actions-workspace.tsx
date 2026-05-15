"use client";

import { useState } from "react";
import type { AIAction } from "@/lib/types/ai-brain";
import { simulateActionExecution } from "@/lib/data/ai-brain";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { AIActionCard } from "./ai-action-card";

type ActionsWorkspaceProps = {
  initialActions: AIAction[];
};

export function ActionsWorkspace({ initialActions }: ActionsWorkspaceProps) {
  const [simulations, setSimulations] = useState<Record<string, string>>({});

  function handleSimulate(id: string) {
    const result = simulateActionExecution(id);
    if (!result) return;
    setSimulations((prev) => ({ ...prev, [id]: result.explanation }));
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <AIBrainPageHeader
        eyebrow="AI Brain · Actions"
        title="AI operational capability management"
        description="What the AI may execute — risk level, approval mode, confidence gates, and execution history. Supervised autonomy, not a generic automation builder."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {initialActions.map((action) => (
          <AIActionCard
            key={action.id}
            action={action}
            onSimulate={handleSimulate}
            simulationExplanation={simulations[action.id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
