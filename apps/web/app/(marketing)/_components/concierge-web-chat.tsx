"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BedDouble,
  Bot,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Send,
} from "lucide-react";

type ChatRole = "assistant" | "user" | "system";
type MessageVariant = "text" | "recommendations";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
  variant?: MessageVariant;
  cards?: RecommendationCard[];
};

type QuickAction = {
  id: string;
  label: string;
  prompt: string;
};

type RecommendationCard = {
  title: string;
  subtitle: string;
  price: string;
  badge: string;
};

type AssistantPlan = {
  states: string[];
  text: string;
  cards?: RecommendationCard[];
};

function nowId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "availability", label: "Müsaitlik kontrol et", prompt: "24-27 Haziran için 2 kişilik oda müsait mi?" },
  { id: "prices", label: "Oda fiyatlarını öğren", prompt: "Temmuz için gecelik fiyat aralıklarınızı paylaşır mısınız?" },
  { id: "plan", label: "Tatilimi planla", prompt: "3 gece için deniz manzaralı bir konaklama planı önerir misiniz?" },
  { id: "reception", label: "Resepsiyon ile görüş", prompt: "Müsaitseniz resepsiyon ekibine yönlendirebilir misiniz?" },
];

const WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "sys_welcome",
    role: "system",
    text: "Tugobo Assistant — Oteller için AI rezervasyon deneyimi (demo).",
    ts: Date.now(),
  },
  {
    id: "ai_welcome",
    role: "assistant",
    text:
      "Tugobo Assistant'a hoş geldiniz.\n\nRezervasyon süreçlerinizi hızlandırmak için buradayım. Müsaitlik kontrolü, oda önerisi, fiyat sunumu ve resepsiyon yönlendirmesi konularında anında yardımcı olabilirim.",
    ts: Date.now(),
  },
  {
    id: "ai_trust",
    role: "assistant",
    text:
      "**7/24 operasyon** · **çok dilli misafir iletişimi** · **hızlı rezervasyon dönüşümü**\n\nİsterseniz sağ üstteki hızlı başlat seçeneklerinden ilerleyelim.",
    ts: Date.now(),
  },
];

function formatTime(ts: number) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

function buildAssistantPlan(userText: string): AssistantPlan {
  const t = userText.toLowerCase();

  if (t.includes("müsait") || t.includes("müsaitlik") || t.includes("availability") || t.includes("haziran")) {
    return {
      states: ["Tarih aralığı doğrulanıyor", "Müsaitlik taranıyor", "En uygun oda seçiliyor"],
      text:
        "24-27 Haziran aralığı için size uygun seçenekleri hazırladım.\n\n" +
        "2 kişilik konaklama için hem fiyat/performans hem de premium segmentte alternatifler mevcut. Dilerseniz ödeme adımı için de örnek rezervasyon akışını gösterebilirim.",
      cards: [
        { title: "Deluxe Garden Room", subtitle: "2 yetişkin · Kahvaltı dahil", price: "₺6.450 / gece", badge: "Müsait" },
        { title: "Executive Sea View", subtitle: "2 yetişkin · Esnek iptal", price: "₺8.900 / gece", badge: "Önerilen" },
      ],
    };
  }

  if (t.includes("fiyat") || t.includes("price")) {
    return {
      states: ["Fiyat aralığı hesaplanıyor", "Kampanya koşulları kontrol ediliyor"],
      text:
        "Elbette. Sezon ve oda tipine göre güncel aralık aşağıdaki gibi görünüyor:\n\n" +
        "• Standart: ₺4.900 - ₺6.200\n" +
        "• Deluxe: ₺6.300 - ₺8.100\n" +
        "• Suite: ₺8.500 - ₺12.400\n\n" +
        "Tarihleri paylaşırsanız net toplam tutarı ve en avantajlı seçeneği tek mesajda özetleyebilirim.",
    };
  }

  if (t.includes("plan") || t.includes("öner") || t.includes("stay") || t.includes("tatil")) {
    return {
      states: ["Konaklama tercihleri analiz ediliyor", "Deneyim paketi hazırlanıyor"],
      text:
        "Memnuniyetle. 3 gecelik premium bir konaklama için önerim:\n\n" +
        "1. Gün: Erken check-in + gün batımı transferi\n" +
        "2. Gün: Özel kahvaltı saati + yarım gün deneyim paketi\n" +
        "3. Gün: Geç check-out opsiyonu\n\n" +
        "İsterseniz bunu oda seçenekleriyle birlikte tek bir rezervasyon teklifine dönüştüreyim.",
      cards: [
        { title: "Signature Escape", subtitle: "3 gece · 2 kişi · transfer dahil", price: "₺22.800 toplam", badge: "En çok tercih edilen" },
      ],
    };
  }

  if (t.includes("resepsiyon") || t.includes("reception") || t.includes("insan")) {
    return {
      states: ["Uygun ekip kontrol ediliyor", "Görüşme özeti hazırlanıyor"],
      text:
        "Elbette. Canlı sistemde bu noktada konuşmayı resepsiyon ekibine anında devrederim ve kısa bir görüşme özeti bırakırım.\n\n" +
        "Bu demo ortamında ise devir simülasyonu yapıyorum. İsterseniz önce tarih/kişi bilgisi alıp ekibe hazır bir rezervasyon özeti çıkarabilirim.",
    };
  }

  return {
    states: ["Talep sınıflandırılıyor", "En uygun akış hazırlanıyor"],
    text:
      "Memnuniyetle yardımcı olurum. En doğru öneri için iki kısa bilgi paylaşabilir misiniz?\n" +
      "• Tarih aralığı\n" +
      "• Kişi sayısı\n\n" +
      "Ardından sizin için net bir müsaitlik ve fiyat özeti hazırlayayım.",
  };
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function ConciergeWebChat() {
  const pathname = usePathname();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [assistantState, setAssistantState] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const lastAssistantLabel = useMemo(() => "Tugobo Assistant", []);
  const isVisibleRoute = pathname === "/" || pathname.startsWith("/dashboard");

  const handleToggleOpen = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollToBottom("auto");
    // focus after open transition begins (mobile keyboards need a beat)
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, [open, scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    scrollToBottom("smooth");
  }, [messages, open, scrollToBottom]);

  // Escape to close + lock scroll (mobile)
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onKey]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const resetTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setInput("");

      const userMsg: ChatMessage = {
        id: nowId("user"),
        role: "user",
        text: trimmed,
        ts: Date.now(),
      };
      setMessages((m) => [...m, userMsg]);

      const plan = buildAssistantPlan(trimmed);
      resetTimers();

      let elapsed = 260;
      plan.states.forEach((stateLabel, idx) => {
        const id = window.setTimeout(() => {
          setAssistantState(stateLabel);
        }, elapsed);
        timersRef.current.push(id);
        elapsed += idx === 0 ? 900 : 780;
      });

      const finalId = window.setTimeout(() => {
        const ai: ChatMessage = {
          id: nowId("ai"),
          role: "assistant",
          text: plan.text,
          ts: Date.now(),
          variant: plan.cards?.length ? "recommendations" : "text",
          cards: plan.cards,
        };
        setMessages((m) => [...m, ai]);
        setAssistantState(null);
      }, elapsed);
      timersRef.current.push(finalId);
    },
    [resetTimers]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onQuickAction(a: QuickAction) {
    if (!open) setOpen(true);
    send(a.prompt);
  }

  if (!mounted || !isVisibleRoute) return null;

  return createPortal(
    <>
      {/* Floating entry button */}
      <div
        className={[
          "fixed bottom-6 right-6 pointer-events-auto z-[9999]",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label={open ? "Sohbeti kapat" : "Tugobo Assistant ile sohbet et"}
          className={[
            "group relative",
            "flex items-center gap-3",
            "rounded-2xl",
            "px-4 py-3",
            "border border-white/[0.10]",
            "bg-zinc-950/65 backdrop-blur-xl",
            "shadow-2xl shadow-black/60",
            "transition-all duration-300",
            "hover:bg-zinc-950/75 hover:border-white/[0.16]",
            "active:scale-[0.98]",
            "cursor-pointer",
            open ? "opacity-0 scale-[0.96] pointer-events-none" : "",
          ].join(" ")}
        >
          {/* calm presence halo */}
          <span className="absolute -inset-0.5 rounded-[18px] bg-gradient-to-r from-blue-500/[0.14] via-violet-500/[0.12] to-emerald-500/[0.10] blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-shimmer-soft" />
          <span className="absolute -inset-px rounded-[18px] bg-white/[0.02]" />

          <span className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.10]">
            <Image src="/Logo.png" alt="Tugobo AI" width={92} height={26} className="h-[18px] w-auto opacity-95" />
            <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-live-pulse" />
          </span>

          <span className="relative flex flex-col items-start leading-tight">
            <span className="text-[13px] font-semibold text-white/85 flex items-center gap-2">
              Tugobo Assistant
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-emerald-500/[0.10] border border-emerald-500/[0.20]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
                <span className="text-[10px] font-semibold text-emerald-300/90">Online</span>
              </span>
            </span>
            <span className="text-[11px] text-white/35">AI Reservation Assistant</span>
          </span>

          <span className="relative ml-2 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/45 group-hover:text-white/70 transition-colors w-9 h-9">
            <MessageSquare className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Panel */}
      <div
        className={[
          "fixed bottom-6 right-6 z-[10000]",
          "w-[min(420px,calc(100vw-24px))] sm:w-[min(420px,calc(100vw-40px))]",
          "h-[min(620px,calc(100vh-24px))] sm:h-[min(660px,calc(100vh-48px))]",
          "max-sm:top-16 max-sm:left-3 max-sm:right-3 max-sm:bottom-3 max-sm:w-auto max-sm:h-auto",
          "transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-3 scale-[0.985] pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-label="Tugobo Assistant sohbet penceresi"
      >
        <div className="relative h-full rounded-3xl border border-white/[0.10] bg-zinc-950/55 backdrop-blur-2xl shadow-2xl shadow-black/70 overflow-hidden">
          {/* premium surface gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_30%_0%,rgba(59,130,246,0.10),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_25%,rgba(139,92,246,0.08),transparent_60%)]" />

          {/* Header */}
          <div className="relative px-4 pt-4 pb-3 border-b border-white/[0.06] bg-zinc-950/40">
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Image src="/Logo.png" alt="Tugobo AI" width={96} height={26} className="h-[18px] w-auto opacity-95" />
                <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-live-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-white/90 truncate">
                    AI Reservation Assistant
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-blue-500/[0.10] border border-blue-500/[0.18]">
                    <Sparkles className="w-3 h-3 text-blue-300/90" />
                    <span className="text-[10px] font-semibold text-blue-200/80">Demo</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/35">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-pulse" />
                    Genellikle saniyeler içinde yanıtlar
                  </span>
                  <span className="text-[11px] text-white/18">·</span>
                  <span className="text-[11px] text-white/25">Rezervasyon concierge deneyimi</span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Welcome + quick actions (top strip) */}
          <div className="relative px-4 pt-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onQuickAction(a)}
                  className={[
                    "px-3 py-1.5 rounded-full",
                    "text-[12px] font-medium",
                    "bg-white/[0.03] border border-white/[0.08]",
                    "text-white/50 hover:text-white/75 hover:border-white/[0.14] hover:bg-white/[0.05]",
                    "transition-all active:scale-[0.98] cursor-pointer",
                  ].join(" ")}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="relative mt-3 px-4 pb-24 h-[calc(100%-176px)] overflow-y-auto tugobo-chat-scroll"
          >
            <div className="space-y-3">
              {messages
                .filter((m): m is ChatMessage & { role: "assistant" | "user" } => m.role !== "system")
                .map((m) => (
                  <MessageBubble
                    key={m.id}
                    role={m.role}
                    text={m.text}
                    meta={m.role === "assistant" ? `${lastAssistantLabel} · ${formatTime(m.ts)}` : formatTime(m.ts)}
                    variant={m.variant}
                    cards={m.cards}
                  />
                ))}

              {assistantState && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-blue-500/[0.10] border border-blue-500/[0.18] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-blue-300/90" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] animate-typing-breathe">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/35 animate-typing-dot [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/35 animate-typing-dot [animation-delay:250ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/35 animate-typing-dot [animation-delay:500ms]" />
                      </div>
                      <span className="text-[11px] text-white/45">{assistantState}...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-3 border-t border-white/[0.06] bg-zinc-950/55 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Müsaitlik, fiyat veya oda önerisi sor..."
                  className={[
                    "w-full h-11 px-4 rounded-2xl",
                    "bg-white/[0.04] border border-white/[0.09]",
                    "text-[13px] text-white/85 placeholder:text-white/25",
                    "focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06]",
                    "transition-all",
                  ].join(" ")}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className={[
                  "h-11 w-11 rounded-2xl",
                  "flex items-center justify-center",
                  "bg-blue-600/90 hover:bg-blue-600",
                  "border border-blue-500/40",
                  "text-white",
                  "transition-all active:scale-[0.98] cursor-pointer",
                  "disabled:opacity-40 disabled:hover:bg-blue-600/90 disabled:cursor-not-allowed",
                ].join(" ")}
                aria-label="Gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-white/20 flex items-center justify-between">
              <span>Demo sürüm: gerçek AI ve canlı rezervasyon bağlantısı yakında.</span>
              <span className="hidden sm:inline">Tugobo AI · Hotel Operating Intelligence</span>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}

function MessageBubble({
  role,
  text,
  meta,
  variant,
  cards,
}: {
  role: "assistant" | "user";
  text: string;
  meta: string;
  variant?: MessageVariant;
  cards?: RecommendationCard[];
}) {
  const isAI = role === "assistant";
  return (
    <div className={isAI ? "flex items-end gap-2 animate-msg-in" : "flex items-end justify-end gap-2 animate-msg-in"}>
      {isAI && (
        <div className="w-8 h-8 rounded-2xl bg-blue-500/[0.10] border border-blue-500/[0.18] flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-blue-300/90" />
        </div>
      )}

      <div className={isAI ? "max-w-[86%]" : "max-w-[86%] flex flex-col items-end"}>
        <div
          className={[
            "rounded-2xl px-3.5 py-2.5",
            "border",
            isAI
              ? "bg-white/[0.04] border-white/[0.08] rounded-bl-md"
              : "bg-blue-600 border-blue-500/30 rounded-br-md",
          ].join(" ")}
        >
          <RichText text={text} invert={isAI} />
        </div>
        {isAI && variant === "recommendations" && cards && cards.length > 0 && (
          <div className="mt-2 space-y-2">
            {cards.map((card) => (
              <div
                key={`${card.title}-${card.price}`}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white/90 flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-blue-300/85 shrink-0" />
                      {card.title}
                    </p>
                    <p className="text-[11px] text-white/40 mt-1">{card.subtitle}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/[0.10] border border-emerald-500/[0.20] text-emerald-300/90 shrink-0">
                    {card.badge}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white/85">{card.price}</span>
                  <button
                    type="button"
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/[0.10] border border-blue-500/[0.20] text-blue-200/85 hover:text-blue-100 hover:bg-blue-500/[0.16] transition-colors"
                  >
                    Teklife ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className={isAI ? "mt-1 text-[10px] text-white/18" : "mt-1 text-[10px] text-white/25"}>
          {meta}
        </div>
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-semibold text-white/50">Siz</span>
        </div>
      )}
    </div>
  );
}

function RichText({ text, invert }: { text: string; invert: boolean }) {
  // Minimal markdown-ish: **bold** + \n line breaks (no external deps)
  const parts = useMemo(() => {
    const out: Array<{ t: string; b: boolean }> = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    for (;;) {
      const m = re.exec(text);
      if (!m) break;
      if (m.index > last) out.push({ t: text.slice(last, m.index), b: false });
      out.push({ t: m[1] ?? "", b: true });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ t: text.slice(last), b: false });
    return out;
  }, [text]);

  return (
    <p className={invert ? "text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap" : "text-[13px] text-white leading-relaxed whitespace-pre-wrap"}>
      {parts.map((p, i) =>
        p.b ? (
          <strong key={i} className={invert ? "font-semibold text-white" : "font-semibold text-white"}>
            {p.t}
          </strong>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </p>
  );
}

