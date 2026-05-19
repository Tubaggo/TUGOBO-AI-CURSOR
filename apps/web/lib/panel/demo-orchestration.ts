"use client";

import type { ChannelType, ConversationStage } from "@/lib/channels/types";
import type { OperationalEventType } from "@/lib/runtime/events/types";

export type DemoOrchestrationScenarioId =
  | "whatsapp_inquiry"
  | "web_chat_booking"
  | "payment_failed"
  | "booking_confirmed"
  | "human_support"
  | "vip_guest";

export type DemoOrchestrationScenario = {
  id: DemoOrchestrationScenarioId;
  label: string;
  description: string;
  channel?: Exclude<ChannelType, "manual">;
  runtimeEvent?: OperationalEventType;
  stage?: ConversationStage;
};

/** Internal sales-demo triggers — orchestrates queue, feed, and runtime together */
export const DEMO_ORCHESTRATION_SCENARIOS: DemoOrchestrationScenario[] = [
  {
    id: "whatsapp_inquiry",
    label: "Yeni WhatsApp talebi",
    description: "Kuyruğa yeni misafir talebi ekler ve AI yanıtını başlatır",
    channel: "whatsapp",
  },
  {
    id: "web_chat_booking",
    label: "Yeni Web Chat rezervasyonu",
    description: "Web Chat üzerinden rezervasyon talebi simüle eder",
    channel: "web_chat",
  },
  {
    id: "payment_failed",
    label: "Ödeme başarısız oldu",
    description: "Ödeme riski ve kurtarma akışını tetikler",
    channel: "whatsapp",
    runtimeEvent: "PAYMENT_FAILED",
    stage: "payment_problem",
  },
  {
    id: "booking_confirmed",
    label: "Rezervasyon onaylandı",
    description: "Onaylı rezervasyon ve gelir güncellemesi",
    runtimeEvent: "BOOKING_CONFIRMED",
    stage: "confirmed",
  },
  {
    id: "human_support",
    label: "İnsan desteği gerekiyor",
    description: "Ekip devri önerisi ve operasyon uyarısı",
    runtimeEvent: "HUMAN_TAKEOVER",
    stage: "human_review",
  },
  {
    id: "vip_guest",
    label: "VIP misafir geldi",
    description: "VIP işaretleme ve öncelikli kuyruk",
    runtimeEvent: "VIP_ESCALATION",
    stage: "human_review",
  },
];
