import type { ChannelType } from "./types";

type DemoIncomingPreset = {
  guestName: string;
  message: string;
  guestPhone?: string;
  language?: string;
};

const WEB_CHAT_PRESETS: DemoIncomingPreset[] = [
  {
    guestName: "Ayşe Kaya",
    message: "Merhaba, 12-15 Ağustos arası deniz manzaralı oda müsait mi?",
    guestPhone: "+90 532 000 1122",
    language: "TR",
  },
  {
    guestName: "Mark Stevens",
    message: "Hi, do you have a deluxe room for two nights next weekend?",
    guestPhone: "+1 415 555 0199",
    language: "EN",
  },
];

const WHATSAPP_PRESETS: DemoIncomingPreset[] = [
  {
    guestName: "Mehmet Arslan",
    message: "15-18 Temmuz için çift kişilik oda fiyatı nedir?",
    guestPhone: "+90 533 221 4455",
    language: "TR",
  },
  {
    guestName: "Claire Dubois",
    message: "Bonjour, chambre double du 20 au 23 juillet — disponibilité ?",
    guestPhone: "+33 6 11 22 33 44",
    language: "FR",
  },
];

const INSTAGRAM_PRESETS: DemoIncomingPreset[] = [
  {
    guestName: "Zeynep Akın",
    message: "DM üzerinden yazıyorum — suite odanız var mı bu hafta sonu?",
    language: "TR",
  },
  {
    guestName: "Luca Bianchi",
    message: "Ciao! Avete disponibilità per una camera superior dal 5 agosto?",
    language: "IT",
  },
];

const PRESETS: Record<Exclude<ChannelType, "manual">, DemoIncomingPreset[]> = {
  web_chat: WEB_CHAT_PRESETS,
  whatsapp: WHATSAPP_PRESETS,
  instagram: INSTAGRAM_PRESETS,
};

let roundRobin: Record<Exclude<ChannelType, "manual">, number> = {
  web_chat: 0,
  whatsapp: 0,
  instagram: 0,
};

export function nextSimulatedIncoming(
  channel: Exclude<ChannelType, "manual">
): DemoIncomingPreset & { channel: typeof channel } {
  const list = PRESETS[channel];
  const idx = roundRobin[channel] % list.length;
  roundRobin[channel] += 1;
  const preset = list[idx]!;
  return { ...preset, channel };
}

export function resetSimulatedIncomingCounters(): void {
  roundRobin = { web_chat: 0, whatsapp: 0, instagram: 0 };
}
