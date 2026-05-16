/** AI Brain domain types — future: Drizzle + vector store projections. */

export const KNOWLEDGE_CATEGORIES = [
  "room_policies",
  "transfers",
  "cancellation",
  "breakfast",
  "spa",
  "pricing",
  "upgrades",
  "seasonal_offers",
  "operational_sop",
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export const KNOWLEDGE_CRITICALITY = ["low", "medium", "high", "critical"] as const;

export type KnowledgeCriticality = (typeof KNOWLEDGE_CRITICALITY)[number];

export const KNOWLEDGE_SOURCES = [
  "pms",
  "policy_manual",
  "revenue_team",
  "operations",
  "ai_learned",
  "seasonal_brief",
] as const;

export type KnowledgeSource = (typeof KNOWLEDGE_SOURCES)[number];

export type KnowledgeEntry = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  confidence: number;
  usageFrequency: number;
  criticality: KnowledgeCriticality;
  source: KnowledgeSource;
  lastUsedAt: string;
  escalationImpact: number;
  linkedGuestIds?: string[];
  linkedReservationIds?: string[];
};

export const PERSONA_LANGUAGE_MODES = [
  "multilingual_auto",
  "english_primary",
  "arabic_vip",
  "turkish_local",
  "formal_european",
] as const;

export type PersonaLanguageMode = (typeof PERSONA_LANGUAGE_MODES)[number];

export const PERSONA_ESCALATION_STYLES = [
  "warm_handoff",
  "concise_ops",
  "vip_white_glove",
  "revenue_protect",
] as const;

export type PersonaEscalationStyle = (typeof PERSONA_ESCALATION_STYLES)[number];

export const PERSONA_HOSPITALITY_STYLES = [
  "luxury",
  "concise_business",
  "family_friendly",
  "arabic_vip",
  "boutique_warm",
] as const;

export type PersonaHospitalityStyle = (typeof PERSONA_HOSPITALITY_STYLES)[number];

export type AIPersona = {
  id: string;
  name: string;
  description: string;
  tone: string;
  languageMode: PersonaLanguageMode;
  escalationStyle: PersonaEscalationStyle;
  hospitalityStyle: PersonaHospitalityStyle;
  active: boolean;
  rules: string[];
  vipHandling: string;
  salesTone: string;
  operationalTone: string;
};

export const AI_ACTION_CATEGORIES = [
  "payments",
  "reservations",
  "upsell",
  "staff",
  "messaging",
  "escalation",
  "loyalty",
] as const;

export type AIActionCategory = (typeof AI_ACTION_CATEGORIES)[number];

export const AI_ACTION_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

export type AIActionRiskLevel = (typeof AI_ACTION_RISK_LEVELS)[number];

export const AI_ACTION_APPROVAL_MODES = [
  "autonomous",
  "confidence_gated",
  "human_required",
  "dual_approval",
] as const;

export type AIActionApprovalMode = (typeof AI_ACTION_APPROVAL_MODES)[number];

export type AIAction = {
  id: string;
  name: string;
  description: string;
  category: AIActionCategory;
  riskLevel: AIActionRiskLevel;
  approvalMode: AIActionApprovalMode;
  confidenceThreshold: number;
  executionCount: number;
  lastExecutedAt: string | null;
  enabled: boolean;
};

export const ESCALATION_SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type EscalationSeverity = (typeof ESCALATION_SEVERITIES)[number];

export const ESCALATION_REASONS = [
  "policy_ambiguity",
  "vip_complaint_risk",
  "payment_friction",
  "multilingual_misunderstanding",
  "low_confidence_quote",
  "sentiment_warning",
  "ota_conflict",
  "human_takeover",
] as const;

export type EscalationReason = (typeof ESCALATION_REASONS)[number];

/** Named operational agents — surfaced across Brain, audit, and live streams (mock runtime). */
export const AI_OPERATIONAL_AGENT_ROLES = [
  "reservation_agent",
  "guest_memory_agent",
  "payment_recovery_agent",
  "escalation_supervisor",
  "revenue_optimization_agent",
] as const;

export type AIOperationalAgentRole = (typeof AI_OPERATIONAL_AGENT_ROLES)[number];

export type EscalationEvent = {
  id: string;
  reason: EscalationReason;
  severity: EscalationSeverity;
  title: string;
  guestImpact: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  aiConfidenceBefore: number;
  aiConfidenceAfter: number | null;
  explanation: string;
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  agentRole?: AIOperationalAgentRole;
};

export const AUDIT_EVENT_TYPES = [
  "decision",
  "action",
  "escalation",
  "override",
  "knowledge_use",
  "policy_trigger",
  "failed_action",
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

/** Cross-module routing hints — mirrors operational modules in the live fabric. */
export type AuditPropagationModule =
  | "conversations"
  | "reservations"
  | "guests"
  | "ai-brain"
  | "escalations"
  | "audit";

export const AUDIT_SEVERITIES = ["info", "low", "medium", "high", "critical"] as const;

export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];

export type AuditEvent = {
  id: string;
  /** Immutable trace handle — mirrors `id` for external correlation (Supabase-ready). */
  eventId?: string;
  type: AuditEventType;
  title: string;
  explanation: string;
  confidence: number;
  knowledgeReferences: string[];
  policyReferences: string[];
  humanOverride: boolean;
  createdAt: string;
  severity?: AuditSeverity;
  propagationTargets?: AuditPropagationModule[];
  conversationId?: string;
  reservationId?: string;
  guestId?: string;
  agentRole?: AIOperationalAgentRole;
  /** Model confidence prior to this trace (runtime simulations). */
  confidenceBefore?: number;
  confidenceDelta?: number;
  actionOutcome?: "success" | "pending" | "blocked" | "escalated";
  escalationId?: string;
  /** Short operational rationale — complements explanation for audit density. */
  rationale?: string;
};

export type AIWorkflowStatus =
  | "running"
  | "paused"
  | "completed"
  | "awaiting_human"
  | "escalated"
  | "blocked"
  | "resolved";

export type AIActiveWorkflow = {
  id: string;
  name: string;
  status: AIWorkflowStatus;
  progressPct: number;
  linkedModule: "conversations" | "reservations" | "guests";
  linkedId: string;
};

export type AIPolicyTrigger = {
  id: string;
  label: string;
  count24h: number;
  lastTriggeredAt: string;
};

export type AIActionFeedItem = {
  id: string;
  actionName: string;
  outcome: "success" | "pending" | "blocked" | "escalated";
  confidence: number;
  explanation: string;
  createdAt: string;
  reservationId?: string;
  conversationId?: string;
  guestId?: string;
  agentRole?: AIOperationalAgentRole;
};

export type ConfidenceBucket = {
  label: string;
  count: number;
  pct: number;
};

export type AIBrainRuntimeHealth = {
  status: "healthy" | "degraded" | "attention";
  uptimePct: number;
  avgResponseMs: number;
  activeWorkflows: number;
  knowledgeCoveragePct: number;
  lastHealthCheckAt: string;
};

export type AIBrainOverview = {
  asOfIso: string;
  runtime: AIBrainRuntimeHealth;
  escalationActivity: {
    active: number;
    unresolved24h: number;
    resolvedToday: number;
  };
  activeWorkflows: AIActiveWorkflow[];
  confidenceDistribution: ConfidenceBucket[];
  humanTakeoverRatio: number;
  aiRevenueInfluenceEur: number;
  aiRevenueInfluencePct: number;
  policyTriggers: AIPolicyTrigger[];
  actionFeed: AIActionFeedItem[];
  activePersonaId: string;
};

export type AIConfigurationPatch = {
  activePersonaId?: string;
  actionEnabled?: { actionId: string; enabled: boolean };
};

export type ActionSimulationResult = {
  actionId: string;
  simulated: true;
  wouldExecute: boolean;
  confidenceRequired: number;
  simulatedConfidence: number;
  approvalPath: string;
  explanation: string;
};
