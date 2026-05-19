"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useOperationConversationStore } from "@/lib/stores/operation-conversation-store";
import { useOperationalRuntime } from "@/stores/operational-runtime";
import {
  DEMO_ORCHESTRATION_SCENARIOS,
  type DemoOrchestrationScenarioId,
} from "@/lib/panel/demo-orchestration";
import { cn } from "@/lib/utils";

export function DemoOrchestrationPanel({
  onConversationCreated,
  className,
}: {
  onConversationCreated?: (conversationId: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerIncoming = useOperationConversationStore((s) => s.triggerDemoIncomingMessage);
  const updateStage = useOperationConversationStore((s) => s.updateConversationStage);
  const dispatch = useOperationalRuntime((s) => s.dispatch);

  function runScenario(id: DemoOrchestrationScenarioId) {
    const scenario = DEMO_ORCHESTRATION_SCENARIOS.find((s) => s.id === id);
    if (!scenario) return;

    let conversationId: string | undefined;

    if (scenario.channel) {
      conversationId = triggerIncoming(scenario.channel);
      if (scenario.stage) {
        window.setTimeout(() => {
          updateStage(conversationId!, scenario.stage!);
        }, 1200);
      }
    }

    if (scenario.runtimeEvent) {
      dispatch(scenario.runtimeEvent, {
        guestLabel: scenario.id === "vip_guest" ? "Elena Petrov" : "Demo Misafir",
        amountEur: scenario.id === "booking_confirmed" ? 780 : 420,
        conversationId,
      });
    }

    if (conversationId) onConversationCreated?.(conversationId);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all",
          "border-violet-500/20 bg-violet-500/[0.08] text-violet-200/80",
          "hover:border-violet-500/30 hover:bg-violet-500/[0.12] hover:text-violet-100",
          "active:scale-[0.98]"
        )}
        aria-expanded={open}
      >
        <Sparkles className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
        Demo senaryosu
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[min(100vw-2rem,260px)] overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-900/98 py-1 shadow-2xl shadow-black/60 backdrop-blur-md animate-panel-fade-in">
          <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-white/30">
            Satış demosu · dahili
          </p>
          {DEMO_ORCHESTRATION_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => runScenario(scenario.id)}
              className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
            >
              <span className="text-[11px] font-medium text-white/80">{scenario.label}</span>
              <span className="text-[10px] leading-snug text-white/35">{scenario.description}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
