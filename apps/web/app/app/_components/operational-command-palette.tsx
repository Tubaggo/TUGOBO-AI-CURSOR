"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Brain,
  CalendarRange,
  Layers,
  MessageSquare,
  Scale,
  Search,
  ShieldAlert,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import type { AuditSeverity } from "@/lib/types/ai-brain";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { useOperationsStore } from "@/store/operations-store";

type CommandKind =
  | "guest"
  | "reservation"
  | "thread"
  | "audit"
  | "policy"
  | "workflow"
  | "escalation";

export type OperationalCommandItem = {
  id: string;
  kind: CommandKind;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function buildOperationalCommands(params: {
  guests: ReturnType<typeof useOperationsStore.getState>["guests"];
  reservations: ReturnType<typeof useOperationsStore.getState>["reservations"];
  conversationSummaries: ReturnType<typeof useOperationsStore.getState>["conversationSummaries"];
  auditEvents: ReturnType<typeof useOperationsStore.getState>["auditEvents"];
  policyTriggers: ReturnType<typeof useOperationsStore.getState>["overview"]["policyTriggers"];
  activeWorkflows: ReturnType<typeof useOperationsStore.getState>["overview"]["activeWorkflows"];
  escalations: ReturnType<typeof useOperationsStore.getState>["escalations"];
}): OperationalCommandItem[] {
  const items: OperationalCommandItem[] = [];

  for (const g of params.guests) {
    items.push({
      id: `g_${g.id}`,
      kind: "guest",
      title: g.name,
      subtitle: `${g.loyaltyTier} · score ${g.aiScore}`,
      href: `/app/guests/${g.id}`,
      keywords: ["guest", normalize(g.name), g.loyaltyTier, ...g.tags.map(normalize)],
    });
    if (g.loyaltyTier === "vip") {
      items.push({
        id: `g_vip_${g.id}`,
        kind: "guest",
        title: `VIP · ${g.name}`,
        subtitle: "VIP guests",
        href: `/app/guests/${g.id}`,
        keywords: ["vip", "guest", normalize(g.name)],
      });
    }
  }

  for (const r of params.reservations) {
    items.push({
      id: `r_${r.id}`,
      kind: "reservation",
      title: r.code,
      subtitle: r.guestName,
      href: `/app/reservations/${r.id}`,
      keywords: ["reservation", normalize(r.code), normalize(r.guestName)],
    });
    if (r.paymentStatus === "payment_failed") {
      items.push({
        id: `r_payfail_${r.id}`,
        kind: "reservation",
        title: `Payment failures · ${r.code}`,
        subtitle: "Payment risk lane",
        href: `/app/reservations/${r.id}`,
        keywords: ["payment", "failure", "failures", normalize(r.code)],
      });
    }
  }

  for (const s of params.conversationSummaries) {
    items.push({
      id: `t_${s.id}`,
      kind: "thread",
      title: s.guestName,
      subtitle: `Thread · ${s.channel}`,
      href: `/app/conversations/${s.id}`,
      keywords: ["thread", "conversation", "open", normalize(s.guestName), normalize(s.lastMessagePreview)],
    });
  }

  for (const a of params.auditEvents.slice(0, 80)) {
    items.push({
      id: `a_${a.id}`,
      kind: "audit",
      title: a.title,
      subtitle: "Audit trace",
      href: `/app/ai-brain/audit`,
      keywords: ["audit", normalize(a.title), normalize(a.explanation), a.type, ...(a.policyReferences ?? [])],
    });
  }

  for (const p of params.policyTriggers) {
    items.push({
      id: `pol_${p.id}`,
      kind: "policy",
      title: p.label,
      subtitle: "Policy trigger",
      href: `/app/ai-brain`,
      keywords: ["policy", normalize(p.label)],
    });
  }

  for (const w of params.activeWorkflows) {
    items.push({
      id: `wf_${w.id}`,
      kind: "workflow",
      title: w.name,
      subtitle: `Workflow · ${w.status}`,
      href: `/app/ai-brain`,
      keywords: ["workflow", normalize(w.name), w.status, w.linkedModule],
    });
  }

  for (const e of params.escalations) {
    items.push({
      id: `esc_${e.id}`,
      kind: "escalation",
      title: e.title,
      subtitle: `${e.severity} · ${e.reason}`,
      href: `/app/ai-brain/escalations`,
      keywords: [
        "escalation",
        "escalations",
        normalize(e.title),
        e.reason,
        e.severity,
      ],
    });
    const created = new Date(e.createdAt);
    const today = new Date();
    if (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    ) {
      items.push({
        id: `esc_today_${e.id}`,
        kind: "escalation",
        title: `Escalations today · ${e.title}`,
        subtitle: "Today",
        href: `/app/ai-brain/escalations`,
        keywords: ["today", "escalation", "escalations", normalize(e.title)],
      });
    }
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
}

const KIND_ICON: Record<CommandKind, React.ReactNode> = {
  guest: <User className="h-3.5 w-3.5 text-white/45" aria-hidden />,
  reservation: <CalendarRange className="h-3.5 w-3.5 text-white/45" aria-hidden />,
  thread: <MessageSquare className="h-3.5 w-3.5 text-white/45" aria-hidden />,
  audit: <Layers className="h-3.5 w-3.5 text-white/45" aria-hidden />,
  policy: <Scale className="h-3.5 w-3.5 text-white/45" aria-hidden />,
  workflow: <Brain className="h-3.5 w-3.5 text-white/45" aria-hidden />,
  escalation: <ShieldAlert className="h-3.5 w-3.5 text-white/45" aria-hidden />,
};

type OperationalCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional badge for AI severity spotlight */
  spotlightSeverity?: AuditSeverity;
};

export function OperationalCommandPalette({
  open,
  onOpenChange,
  spotlightSeverity,
}: OperationalCommandPaletteProps) {
  const mounted = useClientMounted();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const snapshot = useOperationsStore(
    useShallow((s) => ({
      hydrated: s.hydrated,
      guests: s.guests,
      reservations: s.reservations,
      conversationSummaries: s.conversationSummaries,
      auditEvents: s.auditEvents,
      policyTriggers: s.overview.policyTriggers,
      activeWorkflows: s.overview.activeWorkflows,
      escalations: s.escalations,
    }))
  );

  const commands = useMemo(() => {
    if (!mounted || !snapshot.hydrated) return [];
    return buildOperationalCommands(snapshot);
  }, [mounted, snapshot]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return commands.slice(0, 14);
    return commands
      .filter((c) => c.keywords.some((k) => k.includes(q) || q.includes(k)))
      .slice(0, 24);
  }, [commands, query]);

  function runHref(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  if (!mounted) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/72 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-[14vh] z-[90] w-[min(100vw-1.5rem,520px)] -translate-x-1/2 rounded-xl border border-white/[0.1] bg-zinc-950/[0.97] p-0 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] outline-none">
          <Dialog.Title className="sr-only">Operational command center</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search guests, reservations, threads, audit traces, policies, workflows, and escalations.
          </Dialog.Description>
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-white/35" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Command center — guests, payments, VIP, escalations…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-white/88 outline-none placeholder:text-white/28"
            />
            <kbd className="hidden shrink-0 rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/35 sm:inline">
              esc
            </kbd>
          </div>
          {spotlightSeverity ? (
            <p className="border-b border-white/[0.05] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-amber-200/55">
              Spotlight · audit severity {spotlightSeverity}
            </p>
          ) : null}
          <ul className="max-h-[min(52vh,420px)] overflow-y-auto py-1.5">
            {!snapshot.hydrated ? (
              <li className="px-4 py-8 text-center text-[12px] text-white/38">
                Hydrating operational fabric…
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-[12px] text-white/38">
                No operational matches · tighten query or open module rails.
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => runHref(c.href)}
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="mt-0.5 shrink-0">{KIND_ICON[c.kind]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-white/88">{c.title}</span>
                      {c.subtitle ? (
                        <span className="mt-0.5 block text-[11px] text-white/38">{c.subtitle}</span>
                      ) : null}
                      <span className="mt-1 inline-flex rounded border border-white/[0.06] bg-black/28 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white/28">
                        {c.kind}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-white/22" aria-hidden />
                  </button>
                </li>
              ))
            )}
          </ul>
          <p className="border-t border-white/[0.06] px-3 py-2 text-[10px] text-white/28">
            Operational routing · selections propagate across audit and AI Brain mirrors.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
