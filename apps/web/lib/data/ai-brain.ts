import type {
  AIAction,
  AIBrainOverview,
  AIConfigurationPatch,
  AIPersona,
  ActionSimulationResult,
  AuditEvent,
  EscalationEvent,
  KnowledgeEntry,
} from "@/lib/types/ai-brain";

const HOTEL_ID = "org_tugobo_resort";

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** In-memory persona profiles — replace with hotel-scoped config store. */
let personaProfiles: AIPersona[] = [
  {
    id: "persona_luxury",
    name: "Luxury hospitality mode",
    description: "Warm, elevated tone for suites and VIP arrivals.",
    tone: "Gracious, unhurried, anticipatory",
    languageMode: "multilingual_auto",
    escalationStyle: "vip_white_glove",
    hospitalityStyle: "luxury",
    active: true,
    rules: [
      "Never quote rack without context of guest tier",
      "Offer spa or dining before room-only upsell for VIP",
      "Acknowledge special occasions within first reply",
    ],
    vipHandling: "Named concierge handoff within 2 messages on complaint signals",
    salesTone: "Suggestive, experience-led — never pushy",
    operationalTone: "Confirm logistics precisely; avoid casual abbreviations",
  },
  {
    id: "persona_business",
    name: "Concise business traveler",
    description: "Fast clarity for short stays and airport transfers.",
    tone: "Direct, respectful, time-aware",
    languageMode: "english_primary",
    escalationStyle: "concise_ops",
    hospitalityStyle: "concise_business",
    active: false,
    rules: [
      "Lead with dates, rate, and payment link in one block",
      "Max 3 sentences before actionable CTA",
      "Defer spa/FB upsell unless guest asks",
    ],
    vipHandling: "Flag loyalty tier; no ceremonial language",
    salesTone: "Value clarity — late checkout, Wi‑Fi, breakfast bundle",
    operationalTone: "Bullet logistics; confirm transfer times in 24h format",
  },
  {
    id: "persona_family",
    name: "Family-friendly tone",
    description: "Reassuring guidance for multi-room and child policies.",
    tone: "Patient, clear, safety-conscious",
    languageMode: "multilingual_auto",
    escalationStyle: "warm_handoff",
    hospitalityStyle: "family_friendly",
    active: false,
    rules: [
      "State child policy and extra bed fees proactively",
      "Avoid alcohol-forward upsell on family threads",
      "Link connecting room availability when 2+ rooms requested",
    ],
    vipHandling: "Standard — elevate only on explicit complaint",
    salesTone: "Half-board and activity bundles over room upgrades",
    operationalTone: "Explain check-in times and pool rules plainly",
  },
  {
    id: "persona_arabic_vip",
    name: "Arabic VIP hospitality",
    description: "Cultural hospitality cues for GCC VIP and extended stays.",
    tone: "Honoring, formal warmth, privacy-respecting",
    languageMode: "arabic_vip",
    escalationStyle: "vip_white_glove",
    hospitalityStyle: "arabic_vip",
    active: false,
    rules: [
      "RTL-aware formatting when Arabic detected",
      "Private transfer and late checkout as default options",
      "Never discuss other guests or room numbers",
    ],
    vipHandling: "Immediate Arabic-capable human on payment or complaint friction",
    salesTone: "Suite upgrades and private experiences — discreet framing",
    operationalTone: "Confirm prayer times and halal dining when relevant",
  },
];

let activePersonaId = "persona_luxury";

const KNOWLEDGE_SEED: KnowledgeEntry[] = [
  {
    id: "kn_late_checkout",
    title: "Late checkout policy",
    category: "room_policies",
    summary: "Until 14:00 complimentary for suite guests; 50% day rate after for standard.",
    confidence: 0.94,
    usageFrequency: 128,
    criticality: "high",
    source: "policy_manual",
    lastUsedAt: isoHoursAgo(2),
    escalationImpact: 0.12,
    linkedReservationIds: ["res_88421"],
  },
  {
    id: "kn_sea_upgrade",
    title: "Sea-view upgrade pricing",
    category: "upgrades",
    summary: "€45/night supplement low season; €72 high season; subject to availability hold 4h.",
    confidence: 0.91,
    usageFrequency: 86,
    criticality: "medium",
    source: "revenue_team",
    lastUsedAt: isoHoursAgo(5),
    escalationImpact: 0.08,
    linkedGuestIds: ["g_marina"],
    linkedReservationIds: ["res_88421"],
  },
  {
    id: "kn_vip_transfer",
    title: "VIP airport transfer SOP",
    category: "transfers",
    summary: "Mercedes V-Class default; flight tracking required; 90 min buffer international.",
    confidence: 0.97,
    usageFrequency: 42,
    criticality: "critical",
    source: "operations",
    lastUsedAt: isoHoursAgo(8),
    escalationImpact: 0.22,
    linkedGuestIds: ["g_ahmet"],
    linkedReservationIds: ["res_airport_exec"],
  },
  {
    id: "kn_high_season_cancel",
    title: "High season cancellation policy",
    category: "cancellation",
    summary: "14-day free cancel; 7–13 days 50%; <7 days 100% unless OTA override mapped.",
    confidence: 0.88,
    usageFrequency: 64,
    criticality: "critical",
    source: "policy_manual",
    lastUsedAt: isoDaysAgo(1),
    escalationImpact: 0.31,
    linkedReservationIds: ["res_ota_recovery_01"],
  },
  {
    id: "kn_breakfast_hours",
    title: "Breakfast service rules",
    category: "breakfast",
    summary: "06:30–10:30 main restaurant; in-room until 11:00 for suite tier only.",
    confidence: 0.96,
    usageFrequency: 51,
    criticality: "medium",
    source: "operations",
    lastUsedAt: isoDaysAgo(2),
    escalationImpact: 0.04,
  },
  {
    id: "kn_spa_couples",
    title: "Spa couples policy",
    category: "spa",
    summary: "90-min couples ritual requires 24h pre-book; AI may offer 10% off Mon–Thu.",
    confidence: 0.85,
    usageFrequency: 29,
    criticality: "low",
    source: "seasonal_brief",
    lastUsedAt: isoDaysAgo(3),
    escalationImpact: 0.05,
    linkedGuestIds: ["g_marina"],
  },
  {
    id: "kn_ota_recovery",
    title: "OTA recovery rate guidelines",
    category: "pricing",
    summary: "Match OTA net within 8% for direct conversion; require manager flag if >12%.",
    confidence: 0.82,
    usageFrequency: 37,
    criticality: "high",
    source: "revenue_team",
    lastUsedAt: isoHoursAgo(11),
    escalationImpact: 0.18,
    linkedReservationIds: ["res_ota_recovery_01"],
    linkedGuestIds: ["g_james"],
  },
  {
    id: "kn_honeymoon_bundle",
    title: "Honeymoon upgrade bundle",
    category: "seasonal_offers",
    summary: "Sea-view + sparkling arrival + late checkout package when tags match.",
    confidence: 0.9,
    usageFrequency: 22,
    criticality: "medium",
    source: "seasonal_brief",
    lastUsedAt: isoHoursAgo(18),
    escalationImpact: 0.06,
    linkedGuestIds: ["g_marina"],
    linkedReservationIds: ["res_honeymoon_yuki", "res_88421"],
  },
  {
    id: "kn_payment_hold",
    title: "Payment link hold duration",
    category: "operational_sop",
    summary: "WhatsApp payment links expire 6h; auto-nudge at 3h; escalate at 5h unpaid.",
    confidence: 0.93,
    usageFrequency: 112,
    criticality: "critical",
    source: "operations",
    lastUsedAt: isoHoursAgo(1),
    escalationImpact: 0.28,
    linkedReservationIds: ["res_88421"],
    linkedGuestIds: ["g_marina"],
  },
];

let actionsSeed: AIAction[] = [
  {
    id: "act_payment_link",
    name: "Send payment link",
    description: "Generate and deliver secure payment link via WhatsApp.",
    category: "payments",
    riskLevel: "medium",
    approvalMode: "confidence_gated",
    confidenceThreshold: 0.78,
    executionCount: 342,
    lastExecutedAt: isoHoursAgo(1),
    enabled: true,
  },
  {
    id: "act_create_reservation",
    name: "Create reservation",
    description: "Open hold from qualified conversation with rate snapshot.",
    category: "reservations",
    riskLevel: "high",
    approvalMode: "confidence_gated",
    confidenceThreshold: 0.85,
    executionCount: 89,
    lastExecutedAt: isoHoursAgo(6),
    enabled: true,
  },
  {
    id: "act_upgrade_offer",
    name: "Trigger upgrade offer",
    description: "Personalized room or package upsell based on guest graph.",
    category: "upsell",
    riskLevel: "medium",
    approvalMode: "confidence_gated",
    confidenceThreshold: 0.72,
    executionCount: 156,
    lastExecutedAt: isoHoursAgo(3),
    enabled: true,
  },
  {
    id: "act_assign_staff",
    name: "Assign human staff",
    description: "Route thread to on-duty reservations or concierge lead.",
    category: "staff",
    riskLevel: "low",
    approvalMode: "autonomous",
    confidenceThreshold: 0.55,
    executionCount: 78,
    lastExecutedAt: isoHoursAgo(4),
    enabled: true,
  },
  {
    id: "act_whatsapp_followup",
    name: "Send WhatsApp follow-up",
    description: "Scheduled nudge for payment, documents, or arrival info.",
    category: "messaging",
    riskLevel: "low",
    approvalMode: "autonomous",
    confidenceThreshold: 0.65,
    executionCount: 521,
    lastExecutedAt: isoHoursAgo(0.5),
    enabled: true,
  },
  {
    id: "act_escalate_payment",
    name: "Escalate payment issue",
    description: "Open supervised escalation when payment friction detected.",
    category: "escalation",
    riskLevel: "high",
    approvalMode: "human_required",
    confidenceThreshold: 0.9,
    executionCount: 34,
    lastExecutedAt: isoHoursAgo(2),
    enabled: true,
  },
  {
    id: "act_loyalty_incentive",
    name: "Apply loyalty incentive",
    description: "Attach eligible direct-booking or tier-based incentive.",
    category: "loyalty",
    riskLevel: "medium",
    approvalMode: "dual_approval",
    confidenceThreshold: 0.88,
    executionCount: 19,
    lastExecutedAt: isoDaysAgo(1),
    enabled: false,
  },
];

const ESCALATIONS_SEED: EscalationEvent[] = [
  {
    id: "esc_payment_marina",
    reason: "payment_friction",
    severity: "high",
    title: "Payment link stalled — sea-view hold",
    guestImpact: "Honeymoon guest may lose hold within 2h",
    createdAt: isoHoursAgo(2),
    resolved: false,
    resolvedAt: null,
    aiConfidenceBefore: 0.81,
    aiConfidenceAfter: null,
    explanation:
      "Guest opened link twice without completing. AI lowered confidence on autonomous nudge; supervisor path opened.",
    conversationId: "conv_sea_view_quote",
    reservationId: "res_88421",
    guestId: "g_marina",
  },
  {
    id: "esc_vip_ahmet",
    reason: "vip_complaint_risk",
    severity: "medium",
    title: "VIP transfer timing ambiguity",
    guestImpact: "Executive arrival — risk to first impression",
    createdAt: isoHoursAgo(5),
    resolved: false,
    resolvedAt: null,
    aiConfidenceBefore: 0.76,
    aiConfidenceAfter: null,
    explanation:
      "Flight delay message conflicted with SOP buffer. AI requested human confirm before requoting transfer.",
    conversationId: "conv_airport_transfer",
    reservationId: "res_airport_exec",
    guestId: "g_ahmet",
  },
  {
    id: "esc_policy_ota",
    reason: "policy_ambiguity",
    severity: "medium",
    title: "OTA cancellation vs direct recovery",
    guestImpact: "Recovery offer may breach net-rate guardrail",
    createdAt: isoHoursAgo(9),
    resolved: true,
    resolvedAt: isoHoursAgo(6),
    aiConfidenceBefore: 0.68,
    aiConfidenceAfter: 0.91,
    explanation:
      "Revenue policy required manager-approved discount band. Human override applied with audit trail.",
    reservationId: "res_ota_recovery_01",
    guestId: "g_james",
  },
  {
    id: "esc_multilingual",
    reason: "multilingual_misunderstanding",
    severity: "low",
    title: "Arabic/English room category mismatch",
    guestImpact: "Guest asked for 'deluxe' — mapped to wrong inventory code",
    createdAt: isoDaysAgo(1),
    resolved: true,
    resolvedAt: isoHoursAgo(20),
    aiConfidenceBefore: 0.62,
    aiConfidenceAfter: 0.88,
    explanation: "Persona switched to Arabic VIP mode; knowledge kn_sea_upgrade re-grounded response.",
    guestId: "g_ahmet",
  },
  {
    id: "esc_low_quote",
    reason: "low_confidence_quote",
    severity: "high",
    title: "Low-confidence booking quote",
    guestImpact: "Risk of underpriced multi-room quote",
    createdAt: isoHoursAgo(12),
    resolved: false,
    resolvedAt: null,
    aiConfidenceBefore: 0.58,
    aiConfidenceAfter: null,
    explanation:
      "Connecting rooms + child policy intersection not fully covered in knowledge graph.",
    conversationId: "conv_family_quote",
  },
  {
    id: "esc_sentiment",
    reason: "sentiment_warning",
    severity: "critical",
    title: "Negative sentiment spike — payment nudge thread",
    guestImpact: "Guest perceived pressure; churn risk on direct loyalist",
    createdAt: isoHoursAgo(3),
    resolved: false,
    resolvedAt: null,
    aiConfidenceBefore: 0.74,
    aiConfidenceAfter: null,
    explanation:
      "Second payment reminder triggered sentiment model. AI paused autonomous messaging.",
    conversationId: "conv_payment_nudge",
    guestId: "g_elena",
  },
];

const AUDIT_SEED: AuditEvent[] = [
  {
    id: "aud_upgrade_marina",
    type: "decision",
    title: "Upgrade offer — honeymoon + upsell score",
    explanation:
      "AI offered sea-view upgrade because guest profile matched honeymoon tag + 88% upsell propensity. Referenced kn_honeymoon_bundle and kn_sea_upgrade.",
    confidence: 0.87,
    knowledgeReferences: ["kn_honeymoon_bundle", "kn_sea_upgrade"],
    policyReferences: ["revenue_upsell_v2"],
    humanOverride: false,
    createdAt: isoHoursAgo(4),
    guestId: "g_marina",
    reservationId: "res_88421",
    conversationId: "conv_sea_view_quote",
  },
  {
    id: "aud_payment_blocked",
    type: "failed_action",
    title: "Autonomous payment nudge blocked",
    explanation:
      "act_whatsapp_followup blocked — sentiment_warning on thread. Escalation esc_sentiment opened.",
    confidence: 0.71,
    knowledgeReferences: ["kn_payment_hold"],
    policyReferences: ["guest_sentiment_guard"],
    humanOverride: false,
    createdAt: isoHoursAgo(3),
    conversationId: "conv_payment_nudge",
    guestId: "g_elena",
  },
  {
    id: "aud_ota_override",
    type: "override",
    title: "Human approved OTA recovery discount",
    explanation:
      "Ops Lead approved 10% direct match within guardrail. AI confidence restored after policy kn_ota_recovery confirmation.",
    confidence: 0.91,
    knowledgeReferences: ["kn_ota_recovery", "kn_high_season_cancel"],
    policyReferences: ["ota_recovery_band"],
    humanOverride: true,
    createdAt: isoHoursAgo(6),
    reservationId: "res_ota_recovery_01",
    guestId: "g_james",
  },
  {
    id: "aud_transfer_sop",
    type: "knowledge_use",
    title: "VIP transfer priced from SOP",
    explanation:
      "AI quoted V-Class transfer using kn_vip_transfer; escalated when flight time changed.",
    confidence: 0.93,
    knowledgeReferences: ["kn_vip_transfer"],
    policyReferences: ["transfer_sla"],
    humanOverride: false,
    createdAt: isoHoursAgo(5),
    conversationId: "conv_airport_transfer",
    guestId: "g_ahmet",
    reservationId: "res_airport_exec",
  },
  {
    id: "aud_assign_staff",
    type: "action",
    title: "Staff assigned — low confidence family quote",
    explanation:
      "act_assign_staff invoked after confidence dropped below 0.6 on multi-room policy intersection.",
    confidence: 0.58,
    knowledgeReferences: ["kn_late_checkout"],
    policyReferences: ["family_connecting_rooms"],
    humanOverride: false,
    createdAt: isoHoursAgo(11),
    conversationId: "conv_family_quote",
  },
  {
    id: "aud_policy_trigger",
    type: "policy_trigger",
    title: "Payment hold expiry policy triggered",
    explanation:
      "5h unpaid on res_88421 — kn_payment_hold triggered escalate path and supervisor notification.",
    confidence: 0.89,
    knowledgeReferences: ["kn_payment_hold"],
    policyReferences: ["payment_hold_escalation"],
    humanOverride: false,
    createdAt: isoHoursAgo(1),
    reservationId: "res_88421",
    conversationId: "conv_sea_view_quote",
    guestId: "g_marina",
  },
];

export function getAIBrainOverview(): AIBrainOverview {
  const unresolved = ESCALATIONS_SEED.filter((e) => !e.resolved);
  return {
    asOfIso: new Date().toISOString(),
    runtime: {
      status: unresolved.some((e) => e.severity === "critical") ? "attention" : "healthy",
      uptimePct: 99.4,
      avgResponseMs: 840,
      activeWorkflows: 4,
      knowledgeCoveragePct: 87,
      lastHealthCheckAt: isoHoursAgo(0.25),
    },
    escalationActivity: {
      active: unresolved.length,
      unresolved24h: unresolved.filter(
        (e) => Date.now() - new Date(e.createdAt).getTime() < 86_400_000
      ).length,
      resolvedToday: ESCALATIONS_SEED.filter((e) => e.resolved).length,
    },
    activeWorkflows: [
      {
        id: "wf_payment_recovery",
        name: "Payment recovery — sea-view hold",
        status: "awaiting_human",
        progressPct: 72,
        linkedModule: "conversations",
        linkedId: "conv_sea_view_quote",
      },
      {
        id: "wf_ota_direct",
        name: "OTA → direct conversion",
        status: "running",
        progressPct: 45,
        linkedModule: "reservations",
        linkedId: "res_ota_recovery_01",
      },
      {
        id: "wf_vip_transfer",
        name: "VIP transfer confirmation",
        status: "running",
        progressPct: 60,
        linkedModule: "conversations",
        linkedId: "conv_airport_transfer",
      },
      {
        id: "wf_honeymoon_upsell",
        name: "Honeymoon package optimization",
        status: "running",
        progressPct: 38,
        linkedModule: "guests",
        linkedId: "g_marina",
      },
    ],
    confidenceDistribution: [
      { label: "≥ 90%", count: 124, pct: 38 },
      { label: "80–89%", count: 98, pct: 30 },
      { label: "70–79%", count: 67, pct: 21 },
      { label: "< 70%", count: 36, pct: 11 },
    ],
    humanTakeoverRatio: 0.14,
    aiRevenueInfluenceEur: 18420,
    aiRevenueInfluencePct: 0.23,
    policyTriggers: [
      { id: "pt_payment_hold", label: "Payment hold expiry", count24h: 7, lastTriggeredAt: isoHoursAgo(1) },
      { id: "pt_sentiment", label: "Sentiment guard", count24h: 3, lastTriggeredAt: isoHoursAgo(3) },
      { id: "pt_vip", label: "VIP escalation", count24h: 2, lastTriggeredAt: isoHoursAgo(5) },
      { id: "pt_ota", label: "OTA recovery band", count24h: 4, lastTriggeredAt: isoHoursAgo(9) },
    ],
    actionFeed: [
      {
        id: "feed_1",
        actionName: "Send payment link",
        outcome: "pending",
        confidence: 0.84,
        explanation: "Link regenerated after hold extension — awaiting guest completion.",
        createdAt: isoHoursAgo(1),
        reservationId: "res_88421",
        conversationId: "conv_sea_view_quote",
      },
      {
        id: "feed_2",
        actionName: "Trigger upgrade offer",
        outcome: "success",
        confidence: 0.87,
        explanation: "Honeymoon bundle offered with sea-view supplement per revenue rules.",
        createdAt: isoHoursAgo(4),
        guestId: "g_marina",
      },
      {
        id: "feed_3",
        actionName: "Escalate payment issue",
        outcome: "escalated",
        confidence: 0.79,
        explanation: "Second failed payment attempt — supervisor queue.",
        createdAt: isoHoursAgo(2),
        conversationId: "conv_payment_nudge",
      },
      {
        id: "feed_4",
        actionName: "Assign human staff",
        outcome: "success",
        confidence: 0.62,
        explanation: "Family multi-room quote below confidence threshold.",
        createdAt: isoHoursAgo(11),
        conversationId: "conv_family_quote",
      },
    ],
    activePersonaId,
  };
}

export function getKnowledgeEntries(category?: KnowledgeEntry["category"]): KnowledgeEntry[] {
  if (!category) return [...KNOWLEDGE_SEED];
  return KNOWLEDGE_SEED.filter((k) => k.category === category);
}

export function getKnowledgeEntryById(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_SEED.find((k) => k.id === id);
}

export function getAIActions(): AIAction[] {
  return actionsSeed.map((a) => ({ ...a }));
}

export function getAIActionById(id: string): AIAction | undefined {
  return actionsSeed.find((a) => a.id === id);
}

export function getEscalations(filter?: "active" | "unresolved" | "all"): EscalationEvent[] {
  const list = [...ESCALATIONS_SEED].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (filter === "active") return list.filter((e) => !e.resolved);
  if (filter === "unresolved") return list.filter((e) => !e.resolved);
  return list;
}

export function getAuditEvents(limit?: number): AuditEvent[] {
  const list = [...AUDIT_SEED].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return limit ? list.slice(0, limit) : list;
}

export function getPersonaProfiles(): AIPersona[] {
  return personaProfiles.map((p) => ({ ...p, active: p.id === activePersonaId }));
}

export function getActivePersona(): AIPersona | undefined {
  return personaProfiles.find((p) => p.id === activePersonaId);
}

export function updateAIConfiguration(patch: AIConfigurationPatch): void {
  if (patch.activePersonaId) {
    const exists = personaProfiles.some((p) => p.id === patch.activePersonaId);
    if (exists) activePersonaId = patch.activePersonaId;
  }
  if (patch.actionEnabled) {
    actionsSeed = actionsSeed.map((a) =>
      a.id === patch.actionEnabled!.actionId ? { ...a, enabled: patch.actionEnabled!.enabled } : a
    );
  }
}

export function simulateActionExecution(actionId: string): ActionSimulationResult | null {
  const action = actionsSeed.find((a) => a.id === actionId);
  if (!action) return null;

  const simulatedConfidence = 0.72 + Math.random() * 0.2;
  const wouldExecute =
    action.enabled &&
    simulatedConfidence >= action.confidenceThreshold &&
    action.approvalMode !== "human_required";

  let approvalPath = "Autonomous execution";
  if (action.approvalMode === "human_required") approvalPath = "Human approval required";
  else if (action.approvalMode === "dual_approval") approvalPath = "Dual approval (AI + manager)";
  else if (action.approvalMode === "confidence_gated" && !wouldExecute)
    approvalPath = "Blocked — below confidence threshold";

  return {
    actionId,
    simulated: true,
    wouldExecute,
    confidenceRequired: action.confidenceThreshold,
    simulatedConfidence: Math.round(simulatedConfidence * 100) / 100,
    approvalPath,
    explanation: wouldExecute
      ? `Mock run: ${action.name} would execute at ${Math.round(simulatedConfidence * 100)}% confidence.`
      : `Mock run: ${action.name} would not execute — ${approvalPath}.`,
  };
}

/** Hotel scope marker for future Supabase filters. */
export function getAIBrainHotelId(): string {
  return HOTEL_ID;
}
