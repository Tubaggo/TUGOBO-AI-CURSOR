"use client";

import { useState } from "react";
import { MessageCircle, Globe, Instagram, ChevronDown } from "lucide-react";
import { useOperationConversationStore } from "@/lib/stores/operation-conversation-store";
import { cn } from "@/lib/utils";

export function DemoIncomingSimulator({
  onIncoming,
  className,
}: {
  onIncoming?: (conversationId: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useOperationConversationStore((s) => s.triggerDemoIncomingMessage);

  function fire(channel: "web_chat" | "whatsapp" | "instagram") {
    const id = trigger(channel);
    onIncoming?.(id);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-white/45 transition-colors hover:bg-white/[0.07] hover:text-white/70"
        aria-expanded={open}
      >
        Demo mesajı
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-white/[0.1] bg-zinc-900 py-1 shadow-xl">
          <SimAction icon={Globe} label="Yeni Web Chat mesajı" onClick={() => fire("web_chat")} />
          <SimAction
            icon={MessageCircle}
            label="Yeni WhatsApp mesajı"
            onClick={() => fire("whatsapp")}
          />
          <SimAction
            icon={Instagram}
            label="Yeni Instagram mesajı"
            onClick={() => fire("instagram")}
          />
          <div className="my-1 border-t border-white/[0.06]" />
          <SimAction
            icon={MessageCircle}
            label="Ödeme sorunu"
            onClick={() => {
              trigger("whatsapp");
              setOpen(false);
            }}
          />
          <SimAction
            icon={Globe}
            label="Rezervasyon onayı"
            onClick={() => {
              trigger("web_chat");
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function SimAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Globe;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
      {label}
    </button>
  );
}
