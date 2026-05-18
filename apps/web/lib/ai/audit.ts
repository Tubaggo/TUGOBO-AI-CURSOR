import type { AiRespondRequest, HotelAssistantResponse, AiProviderName } from "./types";

export type AiAuditEntry = {
  id: string;
  timestamp: string;
  conversationId: string;
  mode: "demo" | "live";
  inputMessageLength: number;
  intent: string;
  confidence: number;
  suggestedAction: string;
  requiresHuman: boolean;
  replyLength: number;
  provider: AiProviderName;
  model: string;
  processingMs: number;
  riskSignalCount: number;
};

const MAX_AUDIT_ENTRIES = 200;
const auditLog: AiAuditEntry[] = [];

export function logAiAudit(params: {
  request: AiRespondRequest;
  response: HotelAssistantResponse;
  provider: AiProviderName;
  model: string;
  processingMs: number;
}): AiAuditEntry {
  const entry: AiAuditEntry = {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    conversationId: params.request.conversationId,
    mode: params.request.mode,
    inputMessageLength: params.request.message.length,
    intent: params.response.intent,
    confidence: params.response.confidence,
    suggestedAction: params.response.suggestedAction,
    requiresHuman: params.response.requiresHuman,
    replyLength: params.response.reply.length,
    provider: params.provider,
    model: params.model,
    processingMs: params.processingMs,
    riskSignalCount: params.response.riskSignals.length,
  };

  auditLog.unshift(entry);
  if (auditLog.length > MAX_AUDIT_ENTRIES) auditLog.pop();

  if (process.env.NODE_ENV === "development") {
    console.info("[AI_AUDIT]", {
      id: entry.id,
      conversationId: entry.conversationId,
      intent: entry.intent,
      confidence: entry.confidence,
      requiresHuman: entry.requiresHuman,
      provider: entry.provider,
      model: entry.model,
      processingMs: entry.processingMs,
    });
  }

  return entry;
}

export function getAiAuditLog(limit = 50): readonly AiAuditEntry[] {
  return auditLog.slice(0, limit);
}
