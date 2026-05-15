import type { KnowledgeEntry, KnowledgeCategory } from "@/lib/types/ai-brain";
import { KnowledgeEntryCard } from "./knowledge-entry-card";

type KnowledgeGridProps = {
  entries: KnowledgeEntry[];
  categoryFilter: KnowledgeCategory | "all";
};

export function KnowledgeGrid({ entries, categoryFilter }: KnowledgeGridProps) {
  const filtered =
    categoryFilter === "all" ? entries : entries.filter((e) => e.category === categoryFilter);

  if (filtered.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-12 text-center text-sm text-white/35">
        No knowledge entries in this domain yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((entry) => (
        <KnowledgeEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
