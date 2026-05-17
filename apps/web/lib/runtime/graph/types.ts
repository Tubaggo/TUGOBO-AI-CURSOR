/** Unified operational graph + AI memory runtime types */

export type PropagationNode =
  | "revenue"
  | "reservation"
  | "thread"
  | "guest"
  | "recovery"
  | "alert"
  | "audit"
  | "ai_action"
  | "memory"
  | "timeline";

export type EscalationLevel = "none" | "watch" | "urgent" | "critical";

export type OrchestrationRiskLevel = "low" | "medium" | "high" | "critical";

export type GuestMemory = {
  operational: string[];
  financial: string[];
  orchestration: string[];
  preferences: string[];
  escalationHistory: string[];
  recoveryHistory: string[];
  aiNotes: string[];
};

export type GuestIntelligence = {
  orchestrationRiskLevel: OrchestrationRiskLevel;
  aiConfidenceScore: number;
  recoverySuccessRatio: number;
  loyaltyProbability: number;
  directBookingPotential: number;
  operationalStatus: string;
  memoryAttached: boolean;
};

export type AIReasoning = {
  headline: string;
  factors: string[];
  confidence: number;
  escalationLevel: EscalationLevel;
};

export type GraphPropagation = {
  id: string;
  eventType: string;
  triggeredAt: number;
  nodes: PropagationNode[];
  summary: string;
};

export type UnifiedTimelineEntry = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  timestamp: string;
  actor: "ai" | "human" | "guest" | "system";
  guestId?: string;
  guestLabel?: string;
  reservationId?: string;
  conversationId?: string;
  financialImpactEur?: number;
  propagationNodes: PropagationNode[];
};

export type OrchestrationStatus =
  | "idle"
  | "monitoring"
  | "recovery_active"
  | "escalated"
  | "human_assisted"
  | "resolved";
