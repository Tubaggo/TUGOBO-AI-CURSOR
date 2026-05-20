import type {
  OutboundDeliveryResult,
  OutboundProviderAdapter,
  OutboundTextMessage,
} from "./outbound";

export type ManychatOutboundAdapterConfig = {
  apiUrl?: string;
  apiToken?: string;
  mockMode?: boolean;
  fetchImpl?: typeof fetch;
};

type ManychatApiResponse = {
  id?: unknown;
  message_id?: unknown;
  external_id?: unknown;
  status?: unknown;
};

function readExternalMessageId(payload: ManychatApiResponse): string | undefined {
  const value = payload.message_id ?? payload.external_id ?? payload.id;
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export class ManychatOutboundAdapter implements OutboundProviderAdapter {
  readonly provider = "manychat" as const;

  constructor(private readonly config: ManychatOutboundAdapterConfig = {}) {}

  async sendText(message: OutboundTextMessage): Promise<OutboundDeliveryResult> {
    const apiUrl = this.config.apiUrl;
    const apiToken = this.config.apiToken;
    const shouldMock = this.config.mockMode || !apiUrl || !apiToken;

    if (shouldMock) {
      return {
        provider: this.provider,
        deliveryStatus: "mock_sent",
        externalMessageId: `manychat-mock-${Date.now()}`,
        mockMode: true,
      };
    }

    const fetcher = this.config.fetchImpl ?? fetch;
    const response = await fetcher(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotel_id: message.hotelId,
        conversation_id: message.conversationId,
        external_user_id: message.externalUserId,
        channel: message.channel,
        message: message.message,
        metadata: message.metadata ?? {},
      }),
    });

    if (!response.ok) {
      throw new Error(`manychat_outbound_http_${response.status}`);
    }

    const payload = (await response.json().catch(() => ({}))) as ManychatApiResponse;

    return {
      provider: this.provider,
      deliveryStatus: "sent",
      externalMessageId: readExternalMessageId(payload),
      mockMode: false,
      metadata: {
        providerStatus: typeof payload.status === "string" ? payload.status : undefined,
      },
    };
  }
}
