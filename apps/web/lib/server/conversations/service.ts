import {
  and,
  channels,
  contacts,
  conversations,
  db,
  desc,
  eq,
  messages,
  operationalEvents,
  type DB,
} from "@tugobo/db";
import type { PanelChannelType } from "@tugobo/shared";
import { dbConversationToLive, dbMessageToLive } from "@/lib/channels/db-bridge";
import type { LiveConversation, LiveMessage } from "@/lib/conversation/models";
import type { TakeoverAction } from "@/lib/conversation/models";
import { generateHotelAssistantResponse } from "@/lib/ai/aiClient";
import type { AiRespondRequest } from "@/lib/ai/types";

type ConversationRow = {
  conversation: typeof conversations.$inferSelect;
  contact: typeof contacts.$inferSelect;
  lastBody?: string;
};

function assertDb(): DB {
  if (!db) throw new Error("database_not_configured");
  return db;
}

async function ensurePanelChannel(
  database: DB,
  hotelId: string,
  panelChannel: PanelChannelType
): Promise<string> {
  const phonePlaceholder =
    panelChannel === "web_chat"
      ? `web@${hotelId.slice(0, 8)}`
      : panelChannel === "instagram"
        ? `ig@${hotelId.slice(0, 8)}`
        : `wa@${hotelId.slice(0, 8)}`;

  const existing = await database
    .select({ id: channels.id })
    .from(channels)
    .where(and(eq(channels.hotelId, hotelId), eq(channels.phoneNumber, phonePlaceholder)))
    .limit(1);

  if (existing[0]?.id) return existing[0].id;

  const providerType =
    panelChannel === "web_chat" ? "whatsapp_twilio" : "whatsapp_twilio";

  const [row] = await database
    .insert(channels)
    .values({
      hotelId,
      type: providerType,
      phoneNumber: phonePlaceholder,
      config: { panelChannel },
      isActive: true,
    })
    .returning({ id: channels.id });

  if (!row?.id) throw new Error("channel_create_failed");
  return row.id;
}

async function findOrCreateContact(
  database: DB,
  hotelId: string,
  guestName: string,
  guestPhone: string,
  language?: string
) {
  const [existing] = await database
    .select()
    .from(contacts)
    .where(and(eq(contacts.hotelId, hotelId), eq(contacts.phone, guestPhone)))
    .limit(1);

  if (existing) {
    if (guestName && existing.name !== guestName) {
      await database
        .update(contacts)
        .set({ name: guestName, updatedAt: new Date() })
        .where(eq(contacts.id, existing.id));
    }
    return existing;
  }

  const [created] = await database
    .insert(contacts)
    .values({
      hotelId,
      phone: guestPhone,
      name: guestName,
      language: language?.toLowerCase() ?? "tr",
    })
    .returning();

  if (!created) throw new Error("contact_create_failed");
  return created;
}

export async function listLiveConversations(hotelId: string): Promise<LiveConversation[]> {
  const database = assertDb();

  const rows = await database
    .select({
      conversation: conversations,
      contact: contacts,
    })
    .from(conversations)
    .innerJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(eq(conversations.hotelId, hotelId))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(100);

  const result: LiveConversation[] = [];
  for (const row of rows) {
    const [lastMsg] = await database
      .select({ body: messages.body })
      .from(messages)
      .where(eq(messages.conversationId, row.conversation.id))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    result.push(
      dbConversationToLive(row.conversation, row.contact, lastMsg?.body)
    );
  }
  return result;
}

export async function getConversationMessages(
  conversationId: string
): Promise<LiveMessage[]> {
  const database = assertDb();

  const rows = await database
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  return rows.map(dbMessageToLive);
}

export type IngestMessageParams = {
  hotelId: string;
  channel: PanelChannelType;
  guestName: string;
  message: string;
  externalSessionId?: string;
  conversationId?: string;
  guestPhone?: string;
  language?: string;
};

export async function ingestGuestMessage(
  params: IngestMessageParams
): Promise<{ conversationId: string; messageId: string }> {
  const database = assertDb();
  const now = new Date();
  const phone =
    params.guestPhone?.trim() ||
    (params.externalSessionId
      ? `session:${params.externalSessionId}`
      : `anon:${Date.now()}`);

  const contact = await findOrCreateContact(
    database,
    params.hotelId,
    params.guestName,
    phone,
    params.language
  );

  let conversationId = params.conversationId;

  if (!conversationId && params.externalSessionId) {
    const [existing] = await database
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.hotelId, params.hotelId),
          eq(conversations.externalSessionId, params.externalSessionId)
        )
      )
      .limit(1);
    conversationId = existing?.id;
  }

  if (!conversationId) {
    const channelId = await ensurePanelChannel(database, params.hotelId, params.channel);
    const [conv] = await database
      .insert(conversations)
      .values({
        hotelId: params.hotelId,
        contactId: contact.id,
        channelId,
        panelChannel: params.channel,
        externalSessionId: params.externalSessionId,
        status: "ai_active",
        reservationState: "inquiry",
        lastMessageAt: now,
      })
      .returning();

    if (!conv) throw new Error("conversation_create_failed");
    conversationId = conv.id;
  }

  const [msg] = await database
    .insert(messages)
    .values({
      conversationId,
      direction: "inbound",
      role: "guest",
      body: params.message,
      deliveryStatus: "delivered",
    })
    .returning();

  if (!msg) throw new Error("message_create_failed");

  const currentUnread = await unreadCountFor(database, conversationId);
  await database
    .update(conversations)
    .set({
      lastMessageAt: now,
      unreadCount: currentUnread + 1,
      reservationState: "inquiry",
    })
    .where(eq(conversations.id, conversationId));

  await database.insert(operationalEvents).values({
    hotelId: params.hotelId,
    conversationId,
    kind: "message_received",
    label: "Talep geldi",
  });

  return { conversationId, messageId: msg.id };
}

async function unreadCountFor(database: DB, conversationId: string): Promise<number> {
  const [row] = await database
    .select({ unreadCount: conversations.unreadCount })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  return row?.unreadCount ?? 0;
}

export async function sendOperatorMessage(
  conversationId: string,
  body: string
): Promise<LiveMessage> {
  const database = assertDb();
  const now = new Date();

  const [conv] = await database
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) throw new Error("conversation_not_found");

  const [msg] = await database
    .insert(messages)
    .values({
      conversationId,
      direction: "outbound",
      role: "staff",
      body,
      deliveryStatus: "sent",
      humanOverride: true,
    })
    .returning();

  if (!msg) throw new Error("message_create_failed");

  await database
    .update(conversations)
    .set({ lastMessageAt: now, unreadCount: 0 })
    .where(eq(conversations.id, conversationId));

  return dbMessageToLive(msg);
}

export async function runAiReplyForConversation(
  conversationId: string,
  guestMessage: string
): Promise<LiveMessage | null> {
  const database = assertDb();

  const [row] = await database
    .select({
      conversation: conversations,
      contact: contacts,
    })
    .from(conversations)
    .innerJoin(contacts, eq(conversations.contactId, contacts.id))
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!row || row.conversation.aiPaused || row.conversation.status === "human_takeover") {
    return null;
  }

  const recent = await database
    .select({ role: messages.role, body: messages.body })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(8);

  const aiRequest: AiRespondRequest = {
    conversationId,
    message: guestMessage,
    mode: "live",
    guest: {
      name: row.contact.name ?? undefined,
      language: row.contact.language ?? undefined,
    },
    recentMessages: recent.reverse().map((m) => ({
      role: m.role === "staff" ? "staff" : m.role === "ai" ? "ai" : "guest",
      content: m.body,
    })),
  };

  const result = await generateHotelAssistantResponse(aiRequest);
  const replyText =
    result.ok && result.data.reply
      ? result.data.reply
      : "Teşekkür ederim, talebinizi aldım. Size en kısa sürede dönüş yapacağım.";

  const stageMap: Record<string, typeof row.conversation.reservationState> = {
    offer_sent: "quoted",
    payment_pending: "payment_pending",
    confirmed: "confirmed",
    payment_problem: "payment_pending",
    human_review: "inquiry",
    new_inquiry: "inquiry",
    qualified: "inquiry",
  };

  const reservationState =
    result.ok && result.data.reservationStage
      ? (stageMap[result.data.reservationStage] ?? "inquiry")
      : "inquiry";

  const paymentState =
    result.ok && result.data.paymentStatus === "pending"
      ? "pending"
      : result.ok && result.data.paymentStatus === "failed"
        ? "failed"
        : result.ok && result.data.paymentStatus === "completed"
          ? "completed"
          : "none";

  const [aiMsg] = await database
    .insert(messages)
    .values({
      conversationId,
      direction: "outbound",
      role: "ai",
      body: replyText,
      deliveryStatus: "sent",
      aiGenerated: true,
      aiMeta: result.ok
        ? { provider: result.meta.provider, model: result.meta.model }
        : undefined,
    })
    .returning();

  if (!aiMsg) return null;

  await database
    .update(conversations)
    .set({
      lastMessageAt: new Date(),
      reservationState,
      paymentState,
      escalationState: result.ok && result.data.requiresHuman ? "suggested" : "none",
      status: result.ok && result.data.requiresHuman ? "human_takeover" : "ai_active",
    })
    .where(eq(conversations.id, conversationId));

  if (result.ok && result.data.requiresHuman) {
    await database.insert(operationalEvents).values({
      hotelId: row.conversation.hotelId,
      conversationId,
      kind: "human_suggested",
      label: "İnsan desteği öneriliyor",
    });
  }

  return dbMessageToLive(aiMsg);
}

export async function applyTakeover(
  conversationId: string,
  action: TakeoverAction,
  operatorId?: string
): Promise<LiveConversation> {
  const database = assertDb();
  const now = new Date();

  const updates =
    action === "takeover"
      ? {
          status: "human_takeover" as const,
          aiPaused: true,
          assigneeId: operatorId ?? null,
          operatorJoinedAt: now,
          escalationState: "active" as const,
        }
      : {
          status: "ai_active" as const,
          aiPaused: false,
          operatorJoinedAt: null,
          escalationState: "none" as const,
        };

  const [conv] = await database
    .update(conversations)
    .set(updates)
    .where(eq(conversations.id, conversationId))
    .returning();

  if (!conv) throw new Error("conversation_not_found");

  const [contact] = await database
    .select()
    .from(contacts)
    .where(eq(contacts.id, conv.contactId))
    .limit(1);

  if (!contact) throw new Error("contact_not_found");

  await database.insert(operationalEvents).values({
    hotelId: conv.hotelId,
    conversationId,
    kind: action === "takeover" ? "operator_joined" : "ai_resumed",
    label:
      action === "takeover"
        ? "Operatör görüşmeye katıldı"
        : "AI destek devam ediyor",
  });

  const [lastMsg] = await database
    .select({ body: messages.body })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(1);

  return dbConversationToLive(conv, contact, lastMsg?.body);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const database = assertDb();
  await database
    .update(conversations)
    .set({ unreadCount: 0 })
    .where(eq(conversations.id, conversationId));
}
