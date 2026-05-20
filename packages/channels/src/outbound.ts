export type OutboundProvider =
  | "manychat"
  | "whatsapp_cloud"
  | "instagram_dm"
  | "web_chat";

export type OutboundChannel =
  | "instagram"
  | "whatsapp"
  | "web_chat";

export type OutboundDeliveryStatus = "sent" | "mock_sent" | "failed";

export type OutboundProviderMetadata = Record<string, unknown>;

export type OutboundTextMessage = {
  hotelId: string;
  conversationId: string;
  externalUserId: string;
  channel: OutboundChannel;
  message: string;
  metadata?: OutboundProviderMetadata;
};

export type OutboundDeliveryResult = {
  provider: OutboundProvider;
  deliveryStatus: OutboundDeliveryStatus;
  externalMessageId?: string;
  mockMode: boolean;
  metadata?: OutboundProviderMetadata;
};

export interface OutboundProviderAdapter {
  readonly provider: OutboundProvider;
  sendText(message: OutboundTextMessage): Promise<OutboundDeliveryResult>;
}
