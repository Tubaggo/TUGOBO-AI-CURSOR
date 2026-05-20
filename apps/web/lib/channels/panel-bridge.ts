import type { Conversation, ConversationChannel } from "@/app/dashboard/_components/mock-data";
import type { ChatMsg } from "@/app/dashboard/_components/chat-threads";
import type { ChannelType, ConversationStage, OperationConversation, OperationMessage } from "./types";
import { channelLabel, stageLabel } from "./channelLabels";
import { op as opText } from "@/lib/i18n/operationalTexts";
import { formatTime } from "./ingestMessage";

export function channelTypeToPanel(channel: ChannelType): ConversationChannel {
  if (channel === "web_chat") return "web";
  if (channel === "instagram") return "instagram";
  return "whatsapp";
}

export function panelChannelToType(channel?: ConversationChannel): ChannelType {
  if (channel === "web") return "web_chat";
  if (channel === "instagram") return "instagram";
  return "whatsapp";
}

function stageToLeadStatus(stage: ConversationStage): Conversation["leadStatus"] {
  switch (stage) {
    case "confirmed":
      return "confirmed";
    case "offer_sent":
    case "payment_pending":
      return "quoted";
    case "qualified":
      return "qualified";
    case "payment_problem":
    case "human_review":
      return "new";
    default:
      return "new";
  }
}

function stageToConversationStatus(
  conv: OperationConversation
): Conversation["status"] {
  if (conv.requiresHuman || conv.stage === "human_review") return "human_takeover";
  if (conv.stage === "confirmed") return "resolved";
  return "ai_active";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "şimdi";
  if (mins < 60) return `${mins} dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa`;
  return `${Math.floor(hours / 24)} g`;
}

const AVATAR_COLORS = [
  "bg-violet-600",
  "bg-blue-600",
  "bg-rose-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-cyan-600",
] as const;

function avatarForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function operationToPanelConversation(op: OperationConversation): Conversation {
  return {
    id: op.id,
    contact: {
      name: op.guestName,
      phone: op.guestPhone ?? "—",
      initials: initials(op.guestName),
      avatarColor: avatarForId(op.id),
    },
    lastMessage: op.lastMessage,
    time: relativeTime(op.lastActivityAt),
    language: op.language ?? "TR",
    status: stageToConversationStatus(op),
    leadStatus: stageToLeadStatus(op.stage),
    unread: op.unreadCount ?? 0,
    messageCount: op.messages.length,
    channel: channelTypeToPanel(op.channel),
  };
}

export function operationMessageToChatMsg(msg: OperationMessage): ChatMsg {
  if (msg.sender === "system") {
    return {
      id: msg.id,
      dir: "system",
      body: msg.content,
      time: formatTime(msg.timestamp),
    };
  }
  if (msg.sender === "guest") {
    return {
      id: msg.id,
      dir: "in",
      body: msg.content,
      time: formatTime(msg.timestamp),
    };
  }
  return {
    id: msg.id,
    dir: "out",
    by: msg.sender === "ai" ? "ai" : "human",
    body: msg.content,
    time: formatTime(msg.timestamp),
  };
}

export function operationStageSummary(op: OperationConversation): {
  channelLabel: string;
  stageLabel: string;
  statusLabel: string;
  suggestedAction: string;
  bookingValue?: number;
  requiresHuman: boolean;
  lastActivity: string;
} {
  return {
    channelLabel: channelLabel(op.channel),
    stageLabel: stageLabel(op.stage),
    statusLabel: op.statusLabel,
    suggestedAction: op.requiresHuman
      ? opText("suggestedHumanTakeover")
      : opText("suggestedContinueWatch"),
    bookingValue: op.bookingValue,
    requiresHuman: op.requiresHuman,
    lastActivity: relativeTime(op.lastActivityAt),
  };
}
