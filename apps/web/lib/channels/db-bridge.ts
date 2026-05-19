import type { Conversation as DbConversation, Message as DbMessage, Contact } from "@tugobo/db";
import type { PanelChannelType } from "@tugobo/shared";
import type { LiveConversation, LiveMessage } from "@/lib/conversation/models";
import type { ConversationStage, MessageSender } from "./types";
import { STAGE_STATUS_LABELS } from "./channelLabels";

function dbStatusToPanel(
  status: DbConversation["status"],
  aiPaused: boolean
): LiveConversation["status"] {
  if (status === "human_takeover" || aiPaused) return "human_takeover";
  if (status === "resolved") return "resolved";
  return "ai_active";
}

function reservationStateToStage(state: DbConversation["reservationState"]): ConversationStage {
  switch (state) {
    case "quoted":
      return "offer_sent";
    case "payment_pending":
      return "payment_pending";
    case "confirmed":
      return "confirmed";
    case "cancelled":
      return "human_review";
    case "inquiry":
      return "new_inquiry";
    default:
      return "new_inquiry";
  }
}

function roleFromDb(role: DbMessage["role"]): MessageSender {
  if (role === "staff") return "staff";
  if (role === "ai") return "ai";
  if (role === "system") return "system";
  return "guest";
}

export function dbMessageToLive(msg: DbMessage): LiveMessage {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    role: roleFromDb(msg.role),
    content: msg.body,
    timestamp: msg.createdAt.toISOString(),
    deliveryStatus: msg.deliveryStatus,
    aiGenerated: msg.aiGenerated,
    humanOverride: msg.humanOverride,
  };
}

export function dbConversationToLive(
  conv: DbConversation,
  contact: Contact,
  lastBody?: string
): LiveConversation {
  const stage = reservationStateToStage(conv.reservationState);
  const status = dbStatusToPanel(conv.status, conv.aiPaused);

  return {
    id: conv.id,
    hotelId: conv.hotelId,
    guestName: contact.name ?? "Misafir",
    guestPhone: contact.phone,
    language: contact.language ?? undefined,
    channel: conv.panelChannel as PanelChannelType,
    status,
    stage,
    statusLabel: STAGE_STATUS_LABELS[stage],
    assignedOperatorId: conv.assigneeId ?? undefined,
    aiActive: status === "ai_active",
    aiPaused: conv.aiPaused,
    escalationState: conv.escalationState,
    reservationState: conv.reservationState,
    paymentState: conv.paymentState,
    unreadCount: conv.unreadCount,
    lastMessage: lastBody ?? "",
    lastActivityAt: conv.lastMessageAt.toISOString(),
    externalSessionId: conv.externalSessionId ?? undefined,
    requiresHuman:
      conv.escalationState === "active" ||
      conv.escalationState === "suggested" ||
      status === "human_takeover",
    operatorJoinedAt: conv.operatorJoinedAt?.toISOString(),
  };
}
