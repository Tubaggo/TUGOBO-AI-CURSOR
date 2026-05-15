"use client";

import { Check } from "lucide-react";
import type { AIPersona } from "@/lib/types/ai-brain";
import { cn } from "@/lib/utils";

type PersonaProfileCardProps = {
  persona: AIPersona;
  onActivate: (id: string) => void;
};

export function PersonaProfileCard({ persona, onActivate }: PersonaProfileCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border p-4 transition-colors",
        persona.active
          ? "border-cyan-500/35 bg-gradient-to-br from-cyan-500/[0.08] to-zinc-900/60 ring-1 ring-cyan-500/15"
          : "border-white/[0.07] bg-zinc-900/50 hover:border-white/[0.12]"
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{persona.name}</h3>
          <p className="mt-1 text-xs text-white/45">{persona.description}</p>
        </div>
        {persona.active ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/35 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-200">
            <Check className="h-3 w-3" aria-hidden />
            Active
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onActivate(persona.id)}
            className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/70 transition-colors hover:border-cyan-500/30 hover:text-white"
          >
            Activate
          </button>
        )}
      </header>
      <dl className="mb-3 grid gap-2 text-[11px] sm:grid-cols-2">
        <Field label="Tone" value={persona.tone} />
        <Field label="Languages" value={persona.languageMode.replace(/_/g, " ")} />
        <Field label="Hospitality" value={persona.hospitalityStyle.replace(/_/g, " ")} />
        <Field label="Escalation style" value={persona.escalationStyle.replace(/_/g, " ")} />
        <Field label="VIP handling" value={persona.vipHandling} span />
        <Field label="Sales tone" value={persona.salesTone} span />
        <Field label="Operational tone" value={persona.operationalTone} span />
      </dl>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/35">
          Hospitality rules
        </p>
        <ul className="space-y-1.5">
          {persona.rules.map((r) => (
            <li key={r} className="text-[12px] text-white/55 before:mr-2 before:text-cyan-400/60 before:content-['·']">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Field({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-2", span && "sm:col-span-2")}>
      <dt className="text-white/35">{label}</dt>
      <dd className="mt-0.5 text-white/75">{value}</dd>
    </div>
  );
}
