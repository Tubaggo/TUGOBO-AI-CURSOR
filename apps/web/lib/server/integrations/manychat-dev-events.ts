type ManychatDevRuntimeEvent = {
  id: string;
  messageId?: string;
  hotelId: string;
  provider: "manychat";
  channel: "instagram" | "whatsapp";
  senderType: "guest" | "staff";
  externalUserId: string;
  externalId: string;
  guestName?: string;
  guestPhone?: string;
  message: string;
  createdAt: string;
};

const GLOBAL_KEY = "__tugobo_manychat_dev_runtime_events__";

function runtimeEventsStore(): ManychatDevRuntimeEvent[] {
  const scoped = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: ManychatDevRuntimeEvent[];
  };

  if (!scoped[GLOBAL_KEY]) {
    scoped[GLOBAL_KEY] = [];
  }

  return scoped[GLOBAL_KEY];
}

export function recordManychatDevRuntimeEvent(
  event: Omit<ManychatDevRuntimeEvent, "id" | "createdAt" | "senderType"> & {
    senderType?: ManychatDevRuntimeEvent["senderType"];
  }
) {
  const store = runtimeEventsStore();
  const createdAt = new Date().toISOString();

  store.push({
    ...event,
    id: `manychat-dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    senderType: event.senderType ?? "guest",
    createdAt,
  });

  if (store.length > 200) {
    store.splice(0, store.length - 200);
  }
}

export function listManychatDevRuntimeEvents(since?: string): ManychatDevRuntimeEvent[] {
  const store = runtimeEventsStore();
  if (!since) {
    return [...store];
  }

  const sinceTime = new Date(since).getTime();
  if (Number.isNaN(sinceTime)) {
    return [...store];
  }

  return store.filter((event) => new Date(event.createdAt).getTime() > sinceTime);
}

export type { ManychatDevRuntimeEvent };
