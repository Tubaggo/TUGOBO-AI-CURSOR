"use client";

import { useState } from "react";
import type { KnowledgeCategory, KnowledgeEntry } from "@/lib/types/ai-brain";
import { KNOWLEDGE_CATEGORIES } from "@/lib/types/ai-brain";
import { cn } from "@/lib/utils";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { KnowledgeGrid } from "./knowledge-grid";

const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  room_policies: "Room policies",
  transfers: "Transfers",
  cancellation: "Cancellation",
  breakfast: "Breakfast",
  spa: "Spa",
  pricing: "Pricing",
  upgrades: "Upgrades",
  seasonal_offers: "Seasonal offers",
  operational_sop: "SOPs",
};

type KnowledgeWorkspaceProps = {
  entries: KnowledgeEntry[];
};

export function KnowledgeWorkspace({ entries }: KnowledgeWorkspaceProps) {
  const [category, setCategory] = useState<KnowledgeCategory | "all">("all");

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <AIBrainPageHeader
        eyebrow="AI Brain · Knowledge"
        title="AI operational memory"
        description="Hotel knowledge domains the AI grounds on — confidence, usage, escalation impact, and links to guest outcomes. Not a document wiki."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip active={category === "all"} onClick={() => setCategory("all")} label="All domains" />
        {KNOWLEDGE_CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            active={category === c}
            onClick={() => setCategory(c)}
            label={CATEGORY_LABEL[c]}
          />
        ))}
      </div>
      <KnowledgeGrid entries={entries} categoryFilter={category} />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors",
        active
          ? "border-cyan-500/35 bg-cyan-500/12 text-white"
          : "border-white/[0.08] text-white/45 hover:border-white/[0.12] hover:text-white/70"
      )}
    >
      {label}
    </button>
  );
}
