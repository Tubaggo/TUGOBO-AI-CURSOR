"use client";

import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatTypingIndicator() {
  return (
    <div className={cn("mt-5 flex animate-msg-in items-end gap-2.5")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          "border border-blue-400/20 bg-blue-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        )}
      >
        <Bot className="h-3.5 w-3.5 text-blue-300/90" aria-hidden />
      </div>
      <div
        className={cn(
          "animate-typing-breathe max-w-[min(100%,20rem)] rounded-2xl rounded-bl-md",
          "border border-blue-400/14 bg-blue-600/[0.18]",
          "px-3.5 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-[5px] pt-0.5" aria-hidden>
            <span className="h-[5px] w-[5px] rounded-full bg-blue-200/90 animate-typing-dot [animation-delay:0ms]" />
            <span className="h-[5px] w-[5px] rounded-full bg-blue-200/90 animate-typing-dot [animation-delay:180ms]" />
            <span className="h-[5px] w-[5px] rounded-full bg-blue-200/90 animate-typing-dot [animation-delay:360ms]" />
          </div>
          <span className="h-3 w-px shrink-0 bg-white/10" aria-hidden />
          <div className="flex min-w-0 items-center gap-1 text-[10px] font-medium tracking-wide text-blue-100/55">
            <Sparkles className="h-3 w-3 shrink-0 text-blue-300/70" aria-hidden />
            <span className="truncate">Mia · composing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
