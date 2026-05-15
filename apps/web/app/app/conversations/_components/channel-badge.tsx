import { Globe, Instagram, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversationChannel } from "@/lib/types/conversations";

const CHANNEL_META: Record<
  ConversationChannel,
  { label: string; className: string; Icon: typeof MessageCircle }
> = {
  whatsapp: {
    label: "WhatsApp",
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/95",
    Icon: MessageCircle,
  },
  instagram: {
    label: "Instagram",
    className: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-200/90",
    Icon: Instagram,
  },
  web_chat: {
    label: "Web",
    className: "border-sky-500/25 bg-sky-500/10 text-sky-200/95",
    Icon: Globe,
  },
};

type ChannelBadgeProps = {
  channel: ConversationChannel;
  compact?: boolean;
};

export function ChannelBadge({ channel, compact }: ChannelBadgeProps) {
  const meta = CHANNEL_META[channel];
  const Icon = meta.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.className,
        compact && "px-1"
      )}
      title={meta.label}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
      {!compact ? meta.label : null}
    </span>
  );
}
