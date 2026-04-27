"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bot,
  UserCheck,
  Phone,
  Clock,
  CalendarDays,
  Users,
  Moon,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  User,
  CreditCard,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import {
  CONVERSATIONS,
  type Conversation,
  type ConversationStatus,
} from "../_components/mock-data";
import {
  CHAT_THREADS,
  type ChatMsg,
  type ConvReservation,
  type ChatThread,
} from "../_components/chat-threads";
import { StatusBadge, LeadBadge, LanguageFlag } from "../_components/badges";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "all" | ConversationStatus;

const TABS: { id: Tab; label: string; count: number }[] = [
  { id: "all", label: "All", count: 8 },
  { id: "ai_active", label: "AI", count: 4 },
  { id: "human_takeover", label: "Attention", count: 2 },
  { id: "resolved", label: "Resolved", count: 2 },
];

const CONV_REVENUE: Record<string, { value: string; status: "confirmed" | "pending" | "quoted" }> = {
  c2: { value: "€780", status: "pending" },
  c4: { value: "$850", status: "confirmed" },
  c5: { value: "€650", status: "quoted" },
  c6: { value: "$850", status: "confirmed" },
  c8: { value: "$1,200", status: "confirmed" },
};

// AI message when resuming after staff hand-back — contextual, language-matched
const AI_RESUME: Record<string, string> = {
  c1: "Ahmet Bey, görüşmeyi yeniden devralıyorum! Superior Oda rezervasyonunuzu oluşturmaya hazırım — devam edelim mi? 😊",
  c2: "Hans, I've picked up the conversation! Your Triple Room Premium reservation is still on hold — shall I resend the secure payment link?",
  c3: "Добрый день, Елена! Я снова на связи. Давайте подберём для вас идеальный номер с учётом всех ваших пожеланий. 🌟",
  c4: "Hello Sarah! I've resumed the conversation. Your Deluxe Suite is confirmed for June 15. Is there anything else I can help you with?",
  c5: "Ciao Giulia! Riprendo la conversazione. La Camera Doppia Superior è ancora disponibile per il 10-15 luglio — procedo con la prenotazione? 🌊",
  c6: "Hi James! Back online. Your Deluxe Suite extension to June 27 is confirmed. The additional $340 payment link is ready whenever you are!",
  c7: "Merhaba Fatma Hanım! Animasyon programı ve glutensiz menümüz hakkında detaylı bilgi vermeye hazırım. Aile odası seçeneklerini de paylaşıyorum! 🌟",
  c8: "Hello Mohammed! Your Family Room is fully confirmed for July 1–7. Looking forward to welcoming your family! 🌴",
};

// AI confirmation after payment — per conversation, language-matched
const PAYMENT_CONFIRM_MSGS: Record<string, string> = {
  c2: "Zahlung bestätigt ✅ Ihr Triple Room Premium ist vollständig gebucht!\n\nEine Bestätigung wurde an Ihre WhatsApp gesendet. Wir freuen uns darauf, Sie am 28. Juni begrüßen zu dürfen! 🎉",
  c5: "Pagamento confermato ✅ La Camera Doppia Superior è prenotata!\n\nUna conferma è stata inviata al tuo WhatsApp. Non vediamo l'ora di accoglierti il 10 luglio! 🌊",
};

// Simulated follow-up from Ahmet (c1) — triggers 8 seconds after page load
const INCOMING_MSG: ChatMsg = {
  id: "incoming-ahmet-followup",
  dir: "in",
  body: "Rezervasyon oluşturabilir miyiz? Fiyat için Süperiör oda uygun görünüyor.",
  time: "",
};

// Detects locally-added messages (should receive enter animation)
function isAnimatedMsg(id: string): boolean {
  return (
    id.startsWith("incoming-") ||
    id.startsWith("staff-") ||
    id.startsWith("ai-resume-") ||
    id.startsWith("ai-confirm-") ||
    id.startsWith("sys-payment-")
  );
}

// ─── Toast type ───────────────────────────────────────────────────────────────

type ToastData = { title: string; sub?: string; type: "success" | "new" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("c2");

  // Per-conversation interactive state
  const [localStatuses, setLocalStatuses] = useState<Record<string, ConversationStatus>>({});
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMsg[]>>({});
  const [localTyping, setLocalTyping] = useState<Record<string, boolean>>({});
  const [localUnreads, setLocalUnreads] = useState<Record<string, number>>(
    Object.fromEntries(CONVERSATIONS.map((c) => [c.id, c.unread]))
  );
  const [localLastMsgs, setLocalLastMsgs] = useState<Record<string, string>>({});
  const [confirmedReservations, setConfirmedReservations] = useState<Record<string, boolean>>({});

  const [sentLink, setSentLink] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef(selected);

  // Keep ref in sync for stale-closure safety in timeouts
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // ── Derived values for selected conversation ───────────────────────────────

  const selectedConv = CONVERSATIONS.find((c) => c.id === selected)!;
  const thread = CHAT_THREADS[selected];

  const hasLocalStatus = selected in localStatuses;
  const effectiveStatus: ConversationStatus = localStatuses[selected] ?? selectedConv?.status;
  const allMessages: ChatMsg[] = [...(thread?.messages ?? []), ...(localMessages[selected] ?? [])];
  const isAiTyping = hasLocalStatus
    ? (localTyping[selected] ?? false)
    : (thread?.aiTyping ?? false);

  // Reservation with optional confirmed override after payment
  const rawReservation = thread?.reservation;
  const effectiveReservation: ConvReservation | undefined = rawReservation
    ? confirmedReservations[selected]
      ? { ...rawReservation, status: "confirmed" as const }
      : rawReservation
    : undefined;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showToast(title: string, sub?: string, type: ToastData["type"] = "success") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ title, sub, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3800);
  }

  function addMessages(convId: string, msgs: ChatMsg[]) {
    setLocalMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] ?? []), ...msgs],
    }));
  }

  // ── Effects ────────────────────────────────────────────────────────────────

  // Reset per-conversation UI + clear unreads when switching
  useEffect(() => {
    setSentLink(false);
    setReplyText("");
    setLocalUnreads((prev) => ({ ...prev, [selected]: 0 }));
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 80);
  }, [selected]);

  // Auto-scroll when messages or typing state changes
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [localMessages, localTyping]);

  // Simulate an incoming follow-up from Ahmet (c1) after 8 seconds
  useEffect(() => {
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const incomingId = "c1";
    const timer = setTimeout(() => {
      const msg: ChatMsg = { ...INCOMING_MSG, time: now };
      addMessages(incomingId, [msg]);
      setLocalLastMsgs((prev) => ({ ...prev, [incomingId]: msg.body }));
      // Only bump unread if the user isn't currently viewing c1
      if (selectedRef.current !== incomingId) {
        setLocalUnreads((prev) => ({ ...prev, [incomingId]: (prev[incomingId] ?? 0) + 1 }));
        showToast("New message · Ahmet Yılmaz 🇹🇷", msg.body, "new");
      }
    }, 8000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSendPaymentLink() {
    setSentLink(true);
    const r = effectiveReservation;
    showToast(
      "Payment link sent",
      r ? `${selectedConv.contact.name} · ${r.currency}${r.total.toLocaleString()}` : undefined
    );

    setTimeout(() => {
      setSentLink(false);
      if (!r) return;

      const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const sysMsg: ChatMsg = {
        id: `sys-payment-${Date.now()}`,
        dir: "system",
        body: `Payment received · ${r.currency}${r.total.toLocaleString()} · ${now}`,
        time: now,
      };
      const aiBody =
        PAYMENT_CONFIRM_MSGS[selected] ??
        `Payment confirmed ✅ Your ${r.room} is fully booked!\n\nA confirmation has been sent to your WhatsApp. We look forward to welcoming you on ${r.checkIn}! 🌟`;
      const aiMsg: ChatMsg = {
        id: `ai-confirm-${Date.now()}`,
        dir: "out",
        by: "ai",
        body: aiBody,
        time: now,
      };

      // Mark reservation confirmed before adding messages so the card transitions atomically
      setConfirmedReservations((prev) => ({ ...prev, [selected]: true }));
      addMessages(selected, [sysMsg, aiMsg]);
      showToast(
        "Payment confirmed",
        `${selectedConv.contact.name} · ${r.currency}${r.total.toLocaleString()} received`
      );
    }, 3500);
  }

  function handleTakeover() {
    setLocalStatuses((prev) => ({ ...prev, [selected]: "human_takeover" }));
    setLocalTyping((prev) => ({ ...prev, [selected]: false }));
  }

  function handleHandToAI() {
    setLocalStatuses((prev) => ({ ...prev, [selected]: "ai_active" }));
    setLocalTyping((prev) => ({ ...prev, [selected]: true }));
    setReplyText("");

    const aiBody = AI_RESUME[selected] ?? "Picking up the conversation now! 🤖";
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    setTimeout(() => {
      setLocalTyping((prev) => ({ ...prev, [selected]: false }));
      addMessages(selected, [
        { id: `ai-resume-${Date.now()}`, dir: "out", by: "ai", body: aiBody, time: now },
      ]);
    }, 2400);
  }

  function handleSendReply() {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    addMessages(selected, [
      { id: `staff-${Date.now()}`, dir: "out", by: "human", body: trimmed, time: now },
    ]);
    setReplyText("");
  }

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = CONVERSATIONS.filter((c) => {
    const matchTab = activeTab === "all" || c.status === activeTab;
    const matchSearch =
      !search ||
      c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* Toast */}
      <Toast toast={toast} />

      {/* ── Left: conversation list ──────────────────────────────────────── */}
      <ConvList
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        selected={selected}
        setSelected={setSelected}
        filtered={filtered}
        localUnreads={localUnreads}
        localLastMsgs={localLastMsgs}
      />

      {/* ── Center: chat ─────────────────────────────────────────────────── */}
      {selectedConv && thread ? (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden border-r border-white/[0.05]">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-zinc-950/30">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0",
                  selectedConv.contact.avatarColor
                )}
              >
                {selectedConv.contact.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[13px] font-semibold text-white">{selectedConv.contact.name}</span>
                  <LanguageFlag lang={selectedConv.language} />
                  <StatusBadge status={effectiveStatus} />
                  <LeadBadge status={selectedConv.leadStatus} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-white/30">
                    <Phone className="w-3 h-3" />
                    {selectedConv.contact.phone}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/30">
                    <Clock className="w-3 h-3" />
                    {allMessages.filter((m) => m.dir !== "system").length} messages
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {effectiveReservation && (
                <Link
                  href="/dashboard/reservations"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white/80 hover:bg-white/[0.07] text-[11px] font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View booking
                </Link>
              )}
              {effectiveStatus === "ai_active" && (
                <button
                  onClick={handleTakeover}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15 active:scale-[0.97] text-[11px] font-medium transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Take over
                </button>
              )}
              {effectiveStatus === "human_takeover" && (
                <button
                  onClick={handleHandToAI}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 active:scale-[0.97] text-[11px] font-medium transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Hand to AI
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-1">
            <div className="flex justify-center mb-5">
              <span className="text-[11px] text-white/20 px-3 py-1 bg-white/[0.03] rounded-full border border-white/[0.05]">
                {selectedConv.time.includes("d ago") ? "Yesterday" : "Today"}
              </span>
            </div>
            {allMessages.map((msg, i) => (
              <MessageRow
                key={msg.id}
                msg={msg}
                conv={selectedConv}
                prevDir={i > 0 ? allMessages[i - 1]?.dir : undefined}
              />
            ))}
            {effectiveReservation && (
              <div className="pt-3">
                <ReservationCard
                  reservation={effectiveReservation}
                  convStatus={effectiveStatus}
                  sentLink={sentLink}
                  onSendPaymentLink={handleSendPaymentLink}
                />
              </div>
            )}
            {isAiTyping && <TypingIndicator />}
            <div className="h-2" />
          </div>

          {/* Reply bar */}
          <ReplyBar
            status={effectiveStatus}
            value={replyText}
            onChange={setReplyText}
            onSend={handleSendReply}
            onTakeover={handleTakeover}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/20 text-sm">Select a conversation</p>
        </div>
      )}

      {/* ── Right: guest sidebar ─────────────────────────────────────────── */}
      {selectedConv && thread && (
        <GuestSidebar
          conv={selectedConv}
          thread={thread}
          effectiveStatus={effectiveStatus}
          effectiveReservation={effectiveReservation}
          sentLink={sentLink}
          onSendPaymentLink={handleSendPaymentLink}
          onTakeover={handleTakeover}
          onHandToAI={handleHandToAI}
        />
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: ToastData | null }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-toast-slide pointer-events-none">
      <div
        className={cn(
          "flex items-start gap-3 pl-3.5 pr-5 py-3 rounded-xl border shadow-2xl shadow-black/50 min-w-[220px] max-w-[300px]",
          isSuccess
            ? "bg-zinc-900/95 border-emerald-500/30"
            : "bg-zinc-900/95 border-blue-500/20"
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
            isSuccess ? "bg-emerald-500/15" : "bg-blue-500/15"
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-white/90 leading-tight">{toast.title}</p>
          {toast.sub && (
            <p className="text-[11px] text-white/40 mt-0.5 truncate">{toast.sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ConvList ─────────────────────────────────────────────────────────────────

function ConvList({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  selected,
  setSelected,
  filtered,
  localUnreads,
  localLastMsgs,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  search: string;
  setSearch: (s: string) => void;
  selected: string;
  setSelected: (id: string) => void;
  filtered: typeof CONVERSATIONS;
  localUnreads: Record<string, number>;
  localLastMsgs: Record<string, string>;
}) {
  return (
    <div className="w-[316px] shrink-0 flex flex-col border-r border-white/[0.05] overflow-hidden bg-zinc-950/60">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[13px] font-semibold text-white tracking-tight">Conversations</h1>
            <p className="text-[11px] text-white/30 mt-0.5">Grand Hotel Demo</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-400 tracking-wide">LIVE</span>
          </div>
        </div>

        {/* KPI stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { label: "AI Active", value: "4", color: "text-blue-400", bg: "bg-blue-500/[0.08] border-blue-500/[0.12]" },
            { label: "Pipeline", value: "€3.4k", color: "text-amber-400", bg: "bg-amber-500/[0.08] border-amber-500/[0.12]" },
            { label: "Confirmed", value: "3", color: "text-emerald-400", bg: "bg-emerald-500/[0.08] border-emerald-500/[0.12]" },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-lg border px-2 py-2.5 text-center", stat.bg)}>
              <p className={cn("text-[16px] font-bold leading-none tabular-nums", stat.color)}>{stat.value}</p>
              <p className="text-[9px] text-white/30 mt-1 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests or messages…"
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.07] rounded-lg text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 px-3 py-2 border-b border-white/[0.04] shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-colors",
              activeTab === t.id
                ? "bg-white/[0.09] text-white"
                : "text-white/35 hover:text-white/55 hover:bg-white/[0.04]"
            )}
          >
            {t.id === "ai_active" && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            )}
            {t.id === "human_takeover" && t.count > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
            <span className="truncate">{t.label}</span>
            <span
              className={cn(
                "text-[10px] px-1 py-0.5 rounded-full min-w-[16px] text-center tabular-nums shrink-0",
                activeTab === t.id ? "bg-white/10 text-white/60" : "bg-white/[0.05] text-white/25"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-white/[0.03]">
        {filtered.map((conv) => {
          const revenue = CONV_REVENUE[conv.id];
          const isSelected = selected === conv.id;
          const unread = localUnreads[conv.id] ?? conv.unread;
          const lastMsg = localLastMsgs[conv.id] ?? conv.lastMessage;
          const hasUnread = unread > 0;

          return (
            <button
              key={conv.id}
              onClick={() => setSelected(conv.id)}
              className={cn(
                "w-full text-left px-4 py-3.5 transition-all border-l-2 group",
                isSelected
                  ? "bg-white/[0.06] border-amber-400/60"
                  : "border-transparent hover:bg-white/[0.025] hover:border-white/10",
                // Subtle pulse on list item when unread just appeared (not selected)
                !isSelected && hasUnread && "bg-blue-500/[0.02]"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar with status badge */}
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white",
                      conv.contact.avatarColor
                    )}
                  >
                    {conv.contact.initials}
                  </div>
                  {conv.status === "ai_active" && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-zinc-950 flex items-center justify-center">
                      <Bot className="w-1.5 h-1.5 text-white" />
                    </span>
                  )}
                  {conv.status === "human_takeover" && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-zinc-950" />
                  )}
                  {conv.status === "resolved" && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-zinc-700 rounded-full border-2 border-zinc-950 flex items-center justify-center">
                      <CheckCircle2 className="w-2 h-2 text-white/60" />
                    </span>
                  )}
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-msg-in">
                      {unread}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn(
                          "text-[13px] font-medium truncate transition-colors",
                          hasUnread ? "text-white" : "text-white/75"
                        )}
                      >
                        {conv.contact.name}
                      </span>
                      <LanguageFlag lang={conv.language} />
                    </div>
                    <span className="text-[10px] text-white/25 shrink-0 ml-1">{conv.time}</span>
                  </div>
                  <p
                    className={cn(
                      "text-[11px] truncate mb-2 transition-colors",
                      hasUnread ? "text-white/55" : "text-white/30"
                    )}
                  >
                    {lastMsg}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <StatusBadge status={conv.status} />
                      <LeadBadge status={conv.leadStatus} />
                    </div>
                    {revenue && (
                      <span
                        className={cn(
                          "text-[11px] font-semibold tabular-nums",
                          revenue.status === "confirmed"
                            ? "text-emerald-400/80"
                            : revenue.status === "pending"
                            ? "text-amber-400/80"
                            : "text-blue-400/80"
                        )}
                      >
                        {revenue.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm text-white/20">No conversations found</p>
        )}
      </div>
    </div>
  );
}

// ─── GuestSidebar ─────────────────────────────────────────────────────────────

function GuestSidebar({
  conv,
  thread,
  effectiveStatus,
  effectiveReservation,
  sentLink,
  onSendPaymentLink,
  onTakeover,
  onHandToAI,
}: {
  conv: Conversation;
  thread: ChatThread;
  effectiveStatus: ConversationStatus;
  effectiveReservation: ConvReservation | undefined;
  sentLink: boolean;
  onSendPaymentLink: () => void;
  onTakeover: () => void;
  onHandToAI: () => void;
}) {
  const r = effectiveReservation;
  const showPaymentBtn = r && (r.status === "pending_payment" || r.status === "quoted");

  return (
    <div className="w-[260px] shrink-0 flex flex-col overflow-y-auto bg-zinc-950/50">
      {/* Guest profile */}
      <div className="p-4 border-b border-white/[0.05]">
        <SidebarLabel>Guest</SidebarLabel>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
              conv.contact.avatarColor
            )}
          >
            {conv.contact.initials}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-white leading-tight truncate">
              {conv.contact.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <LanguageFlag lang={conv.language} />
              <span className="text-[11px] text-white/30">{conv.language} speaker</span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <Phone className="w-3 h-3 shrink-0" />
            <span className="font-mono">{conv.contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{conv.messageCount} messages · {conv.time}</span>
          </div>
        </div>
      </div>

      {/* Booking summary */}
      {r && (
        <div className="p-4 border-b border-white/[0.05]">
          <SidebarLabel>Booking</SidebarLabel>
          <div
            className={cn(
              "rounded-xl border p-3.5 transition-all duration-500",
              r.status === "confirmed"
                ? "border-emerald-500/25 bg-emerald-500/[0.05]"
                : r.status === "pending_payment"
                ? "border-amber-500/25 bg-amber-500/[0.05]"
                : "border-blue-500/25 bg-blue-500/[0.05]"
            )}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono text-white/35">#{r.ref}</span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all duration-500",
                  r.status === "confirmed"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : r.status === "pending_payment"
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-blue-500/15 text-blue-400"
                )}
              >
                {r.status === "confirmed"
                  ? "Confirmed"
                  : r.status === "pending_payment"
                  ? "Pending payment"
                  : "Quote sent"}
              </span>
            </div>
            <p className="text-[12px] font-semibold text-white/90 mb-3 leading-snug">{r.room}</p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-white/45">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" />Check-in</span>
                <span className="text-white/70 font-medium">{r.checkIn}</span>
              </div>
              <div className="flex items-center justify-between text-white/45">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" />Check-out</span>
                <span className="text-white/70 font-medium">{r.checkOut}</span>
              </div>
              <div className="flex items-center justify-between text-white/45">
                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />Guests</span>
                <span className="text-white/70 font-medium">{r.guests} · {r.nights} nights</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-baseline justify-between">
              <span className="text-[10px] text-white/30">Total</span>
              <span className="text-[19px] font-bold text-white tabular-nums">
                {r.currency}{r.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="p-4 border-b border-white/[0.05]">
        <SidebarLabel>Quick Actions</SidebarLabel>
        <div className="space-y-2">
          {showPaymentBtn && (
            <button
              onClick={onSendPaymentLink}
              className={cn(
                "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[12px] font-medium transition-all border",
                sentLink
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15 active:scale-[0.98]"
              )}
            >
              {sentLink ? (
                <><CheckCircle2 className="w-4 h-4 shrink-0" />Payment link sent!</>
              ) : (
                <><CreditCard className="w-4 h-4 shrink-0" />Send payment link</>
              )}
            </button>
          )}
          {effectiveStatus === "ai_active" && (
            <button
              onClick={onTakeover}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/50 hover:text-white/80 hover:bg-white/[0.07] text-[12px] font-medium transition-all active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              Take over chat
            </button>
          )}
          {effectiveStatus === "human_takeover" && (
            <button
              onClick={onHandToAI}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 text-[12px] font-medium transition-all active:scale-[0.98]"
            >
              <Bot className="w-4 h-4 shrink-0" />
              Hand back to AI
            </button>
          )}
          {r && (
            <Link
              href="/dashboard/reservations"
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/65 hover:bg-white/[0.06] text-[12px] font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              View full reservation
            </Link>
          )}
        </div>
      </div>

      {/* AI Context */}
      <div className="p-4">
        <SidebarLabel>AI Context</SidebarLabel>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/35">Lead stage</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-semibold",
                conv.leadStatus === "confirmed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : conv.leadStatus === "quoted"
                  ? "bg-blue-500/15 text-blue-400"
                  : conv.leadStatus === "qualified"
                  ? "bg-violet-500/15 text-violet-400"
                  : "bg-white/[0.06] text-white/40"
              )}
            >
              {conv.leadStatus.charAt(0).toUpperCase() + conv.leadStatus.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/35">Handler</span>
            <span
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold transition-all",
                effectiveStatus === "ai_active"
                  ? "bg-blue-500/15 text-blue-400"
                  : effectiveStatus === "human_takeover"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-white/[0.06] text-white/40"
              )}
            >
              {effectiveStatus === "ai_active" ? (
                <><Bot className="w-3 h-3" />Mia AI</>
              ) : effectiveStatus === "human_takeover" ? (
                <><User className="w-3 h-3" />Staff</>
              ) : (
                <><CheckCircle2 className="w-3 h-3" />Resolved</>
              )}
            </span>
          </div>
          {effectiveStatus === "ai_active" && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-white/35">AI confidence</span>
                <span className="text-white/55 font-semibold">87%</span>
              </div>
              <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                  style={{ width: "87%" }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-white/25">
            <TrendingUp className="w-3 h-3" />
            <span>Via WhatsApp · {conv.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SidebarLabel ─────────────────────────────────────────────────────────────

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

// ─── MessageRow ───────────────────────────────────────────────────────────────

function MessageRow({
  msg,
  conv,
  prevDir,
}: {
  msg: ChatMsg;
  conv: Conversation;
  prevDir?: string;
}) {
  const gap = prevDir !== msg.dir ? "mt-3" : "mt-0.5";
  const animated = isAnimatedMsg(msg.id) ? "animate-msg-in" : "";

  if (msg.dir === "system") {
    return (
      <div className={cn("flex justify-center py-1.5", gap, animated)}>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full">
          <Zap className="w-3 h-3 text-white/25" />
          <span className="text-[11px] text-white/35">{msg.body}</span>
          <span className="text-[10px] text-white/20 ml-0.5">{msg.time}</span>
        </div>
      </div>
    );
  }

  if (msg.dir === "in") {
    return (
      <div className={cn("flex items-end gap-2", gap, animated)}>
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
            conv.contact.avatarColor
          )}
        >
          {conv.contact.initials}
        </div>
        <div className="max-w-[68%]">
          <div className="bg-zinc-800/70 border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-2.5">
            <p className="text-[13px] text-white/85 leading-relaxed whitespace-pre-line">{msg.body}</p>
          </div>
          <p className="text-[10px] text-white/20 mt-1 ml-1">{msg.time}</p>
        </div>
      </div>
    );
  }

  // outbound
  const isAI = msg.by === "ai";
  return (
    <div className={cn("flex items-end justify-end gap-2", gap, animated)}>
      <div className="max-w-[68%] flex flex-col items-end">
        <div
          className={cn(
            "rounded-2xl rounded-br-sm px-4 py-2.5",
            isAI ? "bg-blue-600" : "bg-indigo-600"
          )}
        >
          <p className="text-[13px] text-white leading-relaxed whitespace-pre-line">{msg.body}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1 mr-0.5">
          {isAI ? (
            <Bot className="w-2.5 h-2.5 text-white/25" />
          ) : (
            <User className="w-2.5 h-2.5 text-white/25" />
          )}
          <p className="text-[10px] text-white/25">
            {isAI ? "Mia · AI" : "Staff"} · {msg.time}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          isAI
            ? "bg-blue-600/20 border border-blue-500/30"
            : "bg-indigo-600/20 border border-indigo-500/30"
        )}
      >
        {isAI ? (
          <Bot className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <User className="w-3.5 h-3.5 text-indigo-400" />
        )}
      </div>
    </div>
  );
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 pt-2 mt-3 animate-msg-in">
      <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-blue-400" />
      </div>
      <div className="bg-zinc-800/80 border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-[10px] text-white/30 mt-1.5 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" />
          Mia · AI is typing
        </p>
      </div>
    </div>
  );
}

// ─── ReservationCard ──────────────────────────────────────────────────────────

function ReservationCard({
  reservation: r,
  convStatus,
  sentLink,
  onSendPaymentLink,
}: {
  reservation: ConvReservation;
  convStatus: ConversationStatus;
  sentLink: boolean;
  onSendPaymentLink: () => void;
}) {
  const statusMap = {
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle2,
      border: "border-emerald-500/30",
      header: "bg-emerald-500/[0.08]",
      iconColor: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      dot: "bg-emerald-400",
    },
    pending_payment: {
      label: "Pending Payment",
      icon: AlertCircle,
      border: "border-amber-500/30",
      header: "bg-amber-500/[0.07]",
      iconColor: "text-amber-400",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      dot: "bg-amber-400 animate-pulse",
    },
    quoted: {
      label: "Quote Sent",
      icon: FileText,
      border: "border-blue-500/30",
      header: "bg-blue-500/[0.07]",
      iconColor: "text-blue-400",
      badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      dot: "bg-blue-400",
    },
  };

  const s = statusMap[r.status];
  const StatusIcon = s.icon;
  const showPaymentBtn = r.status === "pending_payment" || r.status === "quoted";

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden bg-zinc-900/80 shadow-xl shadow-black/20 transition-all duration-500",
        s.border
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between px-5 py-3.5 transition-all duration-500", s.header)}>
        <div className="flex items-center gap-2.5">
          <StatusIcon className={cn("w-4 h-4 transition-colors duration-500", s.iconColor)} />
          <div>
            <p className="text-sm font-semibold text-white">
              {r.status === "quoted" ? "Quote Created" : "Reservation Created"}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">Grand Hotel Demo · Ref #{r.ref}</p>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-500",
            s.badge
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>

      {/* Details */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[13px] font-semibold text-white/90 mb-3">{r.room}</p>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <DetailCell icon={CalendarDays} label="Check-in" value={r.checkIn} iconColor="text-blue-400" />
          <DetailCell icon={CalendarDays} label="Check-out" value={r.checkOut} iconColor="text-blue-400" />
          <DetailCell icon={Users} label="Guests" value={String(r.guests)} iconColor="text-violet-400" />
          <DetailCell icon={Moon} label="Nights" value={String(r.nights)} iconColor="text-indigo-400" />
        </div>
        <div className="flex items-center justify-between py-3 border-t border-white/[0.06] mb-4">
          <div>
            <p className="text-[11px] text-white/35 mb-0.5">Price per night</p>
            <p className="text-[13px] text-white/60">
              {r.currency}{r.pricePerNight.toLocaleString()} × {r.nights} nights
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/35 mb-0.5">Total amount</p>
            <p className="text-xl font-bold text-white tabular-nums">
              {r.currency}{r.total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pb-4">
        <Link
          href="/dashboard/reservations"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] border border-white/[0.09] text-white/70 hover:text-white hover:bg-white/[0.10] text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View reservation
        </Link>
        {showPaymentBtn && (
          <button
            onClick={onSendPaymentLink}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
              sentLink
                ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                : "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15"
            )}
          >
            {sentLink ? (
              <><CheckCircle2 className="w-3.5 h-3.5" />Link sent!</>
            ) : (
              <><Send className="w-3.5 h-3.5" />Send payment link</>
            )}
          </button>
        )}
        {convStatus === "ai_active" && (
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/45 hover:text-white/70 hover:bg-white/[0.07] text-xs font-medium transition-colors ml-auto">
            <UserCheck className="w-3.5 h-3.5" />
            Take over
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DetailCell ───────────────────────────────────────────────────────────────

function DetailCell({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
      <Icon className={cn("w-3.5 h-3.5 mb-2", iconColor)} />
      <p className="text-[10px] text-white/35 mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-white/85">{value}</p>
    </div>
  );
}

// ─── ReplyBar ─────────────────────────────────────────────────────────────────

function ReplyBar({
  status,
  value,
  onChange,
  onSend,
  onTakeover,
}: {
  status: ConversationStatus;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onTakeover: () => void;
}) {
  if (status === "resolved") {
    return (
      <div className="shrink-0 px-6 py-3.5 border-t border-white/[0.05]">
        <div className="flex items-center justify-center gap-2 py-2">
          <CheckCircle2 className="w-4 h-4 text-white/20" />
          <p className="text-sm text-white/25">Conversation resolved</p>
        </div>
      </div>
    );
  }

  if (status === "ai_active") {
    return (
      <div className="shrink-0 px-6 py-3.5 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-500/[0.06] border border-blue-500/15 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-[13px] text-blue-300/60 flex-1">
            Mia (AI) is responding. Click{" "}
            <button
              onClick={onTakeover}
              className="text-amber-400 font-medium hover:text-amber-300 transition-colors"
            >
              Take over
            </button>{" "}
            to reply manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 px-6 py-3.5 border-t border-white/[0.05]">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder="Type a reply…"
          className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 transition-all"
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
