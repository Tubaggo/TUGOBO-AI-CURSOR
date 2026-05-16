import type { AIActionMemoryEntry } from "./types";
import type { Conversation } from "@/lib/types/conversations";

function iso(minsAgo: number): string {
  return new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
}

/** Seed thread memory so operational timelines feel stateful before first dispatch. */
export function buildSeedActionMemory(conversations: Conversation[]): AIActionMemoryEntry[] {
  const entries: AIActionMemoryEntry[] = [];
  let seq = 0;

  for (const c of conversations) {
    const base = {
      conversationId: c.id,
      reservationId: c.reservationId ?? undefined,
      guestId: c.guestId,
    };

    entries.push({
      id: `mem_seed_${seq++}`,
      kind: "payment_link_sent",
      summary: "Qualification complete · payment path armed",
      agentRole: "reservation_agent",
      createdAt: iso(42),
      ...base,
    });

    if (c.escalationFlag || c.status === "escalated") {
      entries.push({
        id: `mem_seed_${seq++}`,
        kind: "escalation_opened",
        summary: "Escalation supervisor engaged · autonomous send gated",
        agentRole: "escalation_supervisor",
        createdAt: iso(28),
        ...base,
      });
      entries.push({
        id: `mem_seed_${seq++}`,
        kind: "workflow_pause",
        summary: "Confidence degraded on active quote — human review queue",
        agentRole: "escalation_supervisor",
        createdAt: iso(22),
        ...base,
      });
    }

    if (c.status === "human_takeover" || c.aiState === "human_active") {
      entries.push({
        id: `mem_seed_${seq++}`,
        kind: "human_takeover",
        summary: "Staff assumed authoritative control · AI path paused",
        agentRole: "escalation_supervisor",
        createdAt: iso(14),
        ...base,
      });
    }

    if (c.status === "awaiting_payment") {
      entries.push({
        id: `mem_seed_${seq++}`,
        kind: "payment_failed",
        summary: "PSP friction detected · recovery workflow supervising",
        agentRole: "payment_recovery_agent",
        createdAt: iso(18),
        ...base,
      });
    }

    if (c.aiInsight.confidence >= 0.85 && c.aiState === "ai_active") {
      entries.push({
        id: `mem_seed_${seq++}`,
        kind: "upgrade_offered",
        summary: "Revenue agent surfaced availability-aware upgrade",
        agentRole: "revenue_optimization_agent",
        createdAt: iso(8),
        ...base,
      });
    }

    if (c.guest.tags.some((t) => /vip|honeymoon/i.test(t))) {
      entries.push({
        id: `mem_seed_${seq++}`,
        kind: "vip_signal",
        summary: "VIP concierge routing · faster human threshold",
        agentRole: "guest_memory_agent",
        createdAt: iso(35),
        ...base,
      });
    }
  }

  return entries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
