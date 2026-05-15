import { Scale } from "lucide-react";

type PolicyReferenceCardProps = {
  references: string[];
  knowledgeIds?: string[];
};

export function PolicyReferenceCard({ references, knowledgeIds }: PolicyReferenceCardProps) {
  if (references.length === 0 && (!knowledgeIds || knowledgeIds.length === 0)) return null;

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2">
        <Scale className="h-3.5 w-3.5 text-white/40" aria-hidden />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
          Policy & knowledge refs
        </p>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {references.map((r) => (
          <li
            key={r}
            className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-200/90"
          >
            {r.replace(/_/g, " ")}
          </li>
        ))}
        {knowledgeIds?.map((k) => (
          <li
            key={k}
            className="rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-200/90"
          >
            {k.replace(/^kn_/, "")}
          </li>
        ))}
      </ul>
    </div>
  );
}
