"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { sendConversationMessageAction } from "../actions";

type ReplyComposerProps = {
  conversationId: string;
};

export function ReplyComposer({ conversationId }: ReplyComposerProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(authorType: "staff" | "ai") {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    startTransition(async () => {
      await sendConversationMessageAction({
        conversationId,
        content: trimmed,
        authorType,
      });
      setText("");
      router.refresh();
    });
  }

  return (
    <div className="border-t border-white/[0.07] bg-zinc-950/80 px-3 py-3 md:px-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/32">
          Reply as
        </span>
        <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/55">
          Staff message → guest sees as hotel
        </span>
      </div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`reply-${conversationId}`}>
          Message
        </label>
        <textarea
          id={`reply-${conversationId}`}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Operational reply — payment, upgrade, arrival…"
          className="min-h-[52px] flex-1 resize-y rounded-xl border border-white/[0.08] bg-zinc-900/70 px-3 py-2 text-[13px] text-white/88 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("staff")}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-blue-500/35 bg-blue-500/15 px-3 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/25 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Staff
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("ai")}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[11px] font-medium text-white/55 transition hover:bg-white/[0.07] disabled:opacity-50"
          >
            AI assist line
          </button>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-white/28">
        Stub: messages persist in dev memory only — Supabase thread sync in Sprint 3.
      </p>
    </div>
  );
}
