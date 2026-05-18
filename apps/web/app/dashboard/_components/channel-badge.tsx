"use client";

import { Globe, Instagram, MessageCircle, UserRound } from "lucide-react";
import type { ConversationChannel } from "./mock-data";
import type { ChannelType } from "@/lib/channels/types";
import { channelLabel as channelTypeLabel } from "@/lib/channels/channelLabels";
import { channelTypeToPanel } from "@/lib/channels/panel-bridge";
import { cn } from "@/lib/utils";

export function channelDisplayLabel(channel?: ConversationChannel | ChannelType): string {
  if (!channel) return "WhatsApp";
  if (channel === "web" || channel === "web_chat") return "Web Chat";
  if (channel === "instagram") return "Instagram";
  if (channel === "manual") return "Manuel";
  if (channel === "whatsapp") return "WhatsApp";
  return channelTypeLabel(channel as ChannelType);
}

export function ChannelGlyph({
  channel,
  className,
}: {
  channel?: ConversationChannel | ChannelType;
  className?: string;
}) {
  const normalized =
    channel === "web_chat"
      ? "web"
      : channel === "manual"
        ? "manual"
        : (channel as ConversationChannel | undefined);

  if (normalized === "instagram") {
    return <Instagram className={cn("text-pink-400/90", className)} aria-hidden />;
  }
  if (normalized === "web") {
    return <Globe className={cn("text-sky-400/85", className)} aria-hidden />;
  }
  if (normalized === "manual") {
    return <UserRound className={cn("text-violet-400/85", className)} aria-hidden />;
  }
  return <MessageCircle className={cn("text-emerald-400/90", className)} aria-hidden />;
}

export function ChannelBadge({
  channel,
  size = "sm",
  className,
}: {
  channel?: ConversationChannel | ChannelType;
  size?: "sm" | "md";
  className?: string;
}) {
  const panelCh =
    channel === "web_chat" || channel === "whatsapp" || channel === "instagram" || channel === "manual"
      ? channelTypeToPanel(channel)
      : channel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm"
          ? "px-2 py-0.5 text-[10px] border-white/[0.08] bg-white/[0.04] text-white/55"
          : "px-2.5 py-1 text-[11px] border-white/[0.1] bg-white/[0.05] text-white/65",
        className
      )}
      title={channelDisplayLabel(channel)}
    >
      <ChannelGlyph channel={panelCh} className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {channelDisplayLabel(channel)}
    </span>
  );
}
