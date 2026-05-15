import { cn } from "@/lib/utils";
import type { Message, MessageAuthorType } from "@/lib/types/conversations";

const AUTHOR_LABEL: Record<MessageAuthorType, string> = {
  guest: "Guest",
  ai: "Tugobo AI",
  staff: "Staff",
};

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isGuest = message.authorType === "guest";
  const isAi = message.authorType === "ai";
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  return (
    <div
      className={cn(
        "flex w-full",
        isGuest ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[min(92%,520px)] rounded-2xl border px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
          isGuest &&
            "border-white/[0.08] bg-zinc-900/80 text-white/88 rounded-tl-md",
          isAi &&
            "border-blue-500/20 bg-blue-500/[0.08] text-blue-50/95 rounded-tr-md",
          message.authorType === "staff" &&
            "border-amber-500/25 bg-amber-500/[0.07] text-amber-50/95 rounded-tr-md"
        )}
      >
        <div className="mb-1 flex items-center justify-between gap-3">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wide",
              isGuest && "text-white/40",
              isAi && "text-blue-300/80",
              message.authorType === "staff" && "text-amber-200/75"
            )}
          >
            {AUTHOR_LABEL[message.authorType]}
          </span>
          <span className="text-[10px] tabular-nums text-white/28">{time}</span>
        </div>
        <p className="whitespace-pre-wrap text-[13px]">{message.content}</p>
      </div>
    </div>
  );
}
