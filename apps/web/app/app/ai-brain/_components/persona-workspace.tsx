"use client";

import { useState } from "react";
import type { AIPersona } from "@/lib/types/ai-brain";
import { getPersonaProfiles, updateAIConfiguration } from "@/lib/data/ai-brain";
import { AIBrainPageHeader } from "./ai-brain-page-header";
import { AIExplanationCard } from "./ai-explanation-card";
import { PersonaProfileCard } from "./persona-profile-card";

type PersonaWorkspaceProps = {
  initialPersonas: AIPersona[];
};

export function PersonaWorkspace({ initialPersonas }: PersonaWorkspaceProps) {
  const [personas, setPersonas] = useState(initialPersonas);
  const [toast, setToast] = useState<string | null>(null);

  function handleActivate(id: string) {
    updateAIConfiguration({ activePersonaId: id });
    setPersonas(getPersonaProfiles());
    setToast("Persona activated (in-memory mock).");
    window.setTimeout(() => setToast(null), 2800);
  }

  const active = personas.find((p) => p.active);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <AIBrainPageHeader
        eyebrow="AI Brain · Persona"
        title="Operational communication posture"
        description="Tone, hospitality rules, and escalation personality — configured as operational modes, not prompt engineering."
      />
      {active ? (
        <div className="mb-6">
          <AIExplanationCard
            title="Active posture"
            explanation={`${active.name} governs outbound WhatsApp tone, VIP handling (${active.vipHandling}), and sales framing (${active.salesTone}). Changes apply to new threads; in-flight conversations retain prior context until handoff.`}
            confidence={0.92}
          />
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {personas.map((p) => (
          <PersonaProfileCard key={p.id} persona={p} onActivate={handleActivate} />
        ))}
      </div>
      {toast ? (
        <p className="fixed bottom-6 right-6 z-50 rounded-lg border border-cyan-500/30 bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
