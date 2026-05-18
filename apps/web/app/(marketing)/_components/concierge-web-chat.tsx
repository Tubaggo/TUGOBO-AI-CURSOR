"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  MessageSquare,
  Send,
  UserRound,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";
import type { HotelIntelligenceInsights, IntelligenceChatRequest } from "@tugobo/shared";
import { fetchIntelligenceChat } from "@/lib/intelligence-chat-client";
import { bridgeWebChatToPanel } from "@/lib/channels/web-chat-bridge";
import type { FlowId, FlowState, ScenarioAssistantPayload } from "./concierge-web-chat-scenarios";
import {
  advanceScenario,
  detectFlowFromUserText,
  getScenarioEntryPayload,
  randomAssistantDelayMs,
} from "./concierge-web-chat-scenarios";
import { DEMO_ACCESS_LANDING_HREF, useOpenDemoAccessModal } from "./demo-access-modal";
import { useOpenDemoModal } from "./demo-modal";
import {
  SALES_DEMO_CONFIRMED,
  SALES_DEMO_OPENING_SCRIPT,
  SALES_DEMO_PAYMENT_PENDING,
  TUGOBO_SALES_DEMO_EVENT,
  detectSalesDemoIntent,
  salesDemoMetricsPayload,
  type SalesDemoScriptLine,
} from "./sales-demo-scenario-engine";

/** Message roles for the conversation model */
type ChatRole = "visitor" | "assistant" | "system";

type SystemTone = "banner" | "event";

type QuickChip = {
  id: string;
  label: string;
};

type PricePreview = {
  roomLabel: string;
  guestsLabel: string;
  nightsLabel: string;
  totalLabel: string;
};

type ReservationPreview = {
  roomName: string;
  nights: number;
  guests: number;
  dateRangeLabel: string;
  totalLabel: string;
  subtitle?: string;
  ctas: { id: string; label: string }[];
};

type DashboardCtaLink = {
  label: string;
  href: string;
};

/** Qualitative trust / ops hints only — no fabricated analytics */
type ConversionSurface = {
  consultativeLine?: string;
  /** Short operational bridge (dashboard / live ops), no numeric claims */
  operationalTeaser?: string;
  /** Landing-only deep links to hero CTAs (orchestration with page anchors) */
  navigatorChips?: DashboardCtaLink[];
  insights?: string[];
  dashboardLinks?: DashboardCtaLink[];
  demoMailCta?: boolean;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
  systemTone?: SystemTone;
  chips?: QuickChip[];
  pricePreview?: PricePreview;
  reservationPreview?: ReservationPreview;
  conversion?: ConversionSurface;
  /** Visitor bubble attribution (e.g. simulated guest in sales demo) */
  visitorAttribution?: string;
  /** Structured signals from Hotel Operating Intelligence (DeepSeek layer) */
  hotelInsights?: HotelIntelligenceInsights | null;
};

type QuickAction = {
  id: "how_it_works" | "dashboard" | "fit" | "demo" | "sales_live_demo";
  label: string;
};

type SalesDemoPhase = "idle" | "opening" | "await_pay" | "await_confirm" | "done";

function stripBoldMarkers(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1");
}

function buildIntelligenceRequestMessages(
  history: ChatMessage[],
  latestUserLine: string
): IntelligenceChatRequest["messages"] {
  const out: IntelligenceChatRequest["messages"] = [];
  for (const m of history) {
    if (m.role === "system") continue;
    if (m.role === "visitor") {
      out.push({ role: "user", content: stripBoldMarkers(m.text) });
    }
    if (m.role === "assistant") {
      out.push({ role: "assistant", content: stripBoldMarkers(m.text) });
    }
  }
  out.push({ role: "user", content: stripBoldMarkers(latestUserLine) });
  return out.slice(-32);
}

function mapInsightsToChipLabels(ins: HotelIntelligenceInsights | null | undefined): string[] {
  if (!ins) return [];
  const out: string[] = [];
  if (ins.leadIntent) {
    const m: Record<string, string> = {
      booking: "Niyet: rezervasyon / gelir",
      information: "Niyet: bilgi talebi",
      pricing: "Niyet: fiyat / teklif",
      complaint: "Niyet: şikâyet / risk",
      other: "Niyet: genel",
    };
    out.push(m[ins.leadIntent] ?? "Niyet: analiz");
  }
  if (typeof ins.urgencyScore === "number") {
    out.push(`Aciliyet: ${ins.urgencyScore}/100`);
  }
  if (ins.takeoverRecommended === true) {
    out.push("İnsan devralma önerilir");
  }
  if (typeof ins.reservationLikelihood === "number") {
    out.push(`Direkt rezervasyon olasılığı: ${ins.reservationLikelihood}/100`);
  }
  if (ins.nextBestAction) {
    out.push(`Sonraki adım: ${ins.nextBestAction}`);
  }
  return out.slice(0, 6);
}

function nowId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "how_it_works", label: "Digital Hotel OS nasıl çalışır?" },
  { id: "sales_live_demo", label: "Canlı rezervasyon & operasyon demosu" },
  { id: "dashboard", label: "Operasyon panelini göster" },
  { id: "fit", label: "İşletmem için uygunluk" },
  { id: "demo", label: "Kurulum görüşmesi planla" },
];

const WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "sys_welcome",
    role: "system",
    text: "Önizleme ortamı · Canlı kurulumda kanallar, politikalar ve rezervasyon veriniz bu Digital Hotel Operating System’e bağlanır.",
    ts: Date.now(),
    systemTone: "banner",
  },
  {
    id: "ai_welcome",
    role: "assistant",
    text:
      "**Hotel Operating Intelligence** katmanı; **WhatsApp**, **Instagram DM** ve **web** üzerindeki misafir iletişimini tek operasyon kuyruğunda toplar.\n\n**AI destekli operasyon** ile politika ve fiyat kurallarınız uygulanır; **direkt rezervasyon altyapısı** ve **operasyonel görünürlük** (canlı panel) aynı çatı altında çalışır — yalnızca bir chatbot değil, otelinizin dijital işletim sistemi.",
    ts: Date.now(),
  },
];

/** Landing: same ids; only `ai_welcome` may differ when pristine on `/`. */
const LANDING_WELCOME_TEXT: Record<string, string> = {
  sys_welcome: "Önizleme ortamı · Canlı kurulumda kanallar, politikalar ve rezervasyon veriniz bu Digital Hotel Operating System’e bağlanır.",
  ai_welcome:
    "**Hotel Operating Intelligence** katmanı; **WhatsApp**, **Instagram DM** ve **web** üzerindeki misafir iletişimini tek operasyon kuyruğunda toplar.\n\n**AI destekli operasyon** ile politika ve fiyat kurallarınız uygulanır; **direkt rezervasyon altyapısı** ve **operasyonel görünürlük** (canlı panel) aynı çatı altında çalışır — yalnızca bir chatbot değil, otelinizin dijital işletim sistemi.",
};

const OPERATIONAL_TEASERS = [
  "Canlı panelde birleşik misafir iletişimi, operasyon sinyalleri ve direkt rezervasyon hattını aynı görünümde izleyebilirsiniz.",
  "Dashboard üzerinden kanal trafiği, AI operasyon katmanı ve ekip devralmasını Hotel Operating Intelligence perspektifinde değerlendirebilirsiniz.",
] as const;

const ESCALATION_AFTER_3 =
  "Digital Hotel Operating System kurulumunu canlı panel üzerinden adım adım planlayabiliriz.";

const ESCALATION_AFTER_5 =
  "Taahhüt istemeyen kısa bir görüşmede operasyon trafiğinizi, direkt rezervasyon hedeflerinizi ve OTA bağımlılığını azaltma senaryolarını netleştirebiliriz.";

function isDefaultWelcome(msgs: ChatMessage[]): boolean {
  if (msgs.length !== WELCOME_MESSAGES.length) return false;
  return msgs.every((m, i) => {
    const d = WELCOME_MESSAGES[i];
    return Boolean(d && m.id === d.id && m.role === d.role && m.text === d.text);
  });
}

function applyLandingWelcomeCopy(msgs: ChatMessage[]): ChatMessage[] {
  return msgs.map((m) => {
    const t = LANDING_WELCOME_TEXT[m.id];
    return t ? { ...m, text: t } : m;
  });
}

/** Public sales preview — no auth; static mock only */
const PUBLIC_DEMO_PANEL = "/demo/otel-paneli";

function enrichConversion(
  base: ConversionSurface | undefined,
  opts: { visitorActions: number; isLanding: boolean }
): ConversionSurface | undefined {
  if (!base) return undefined;
  let insights = [...(base.insights ?? [])];
  const out: ConversionSurface = {
    ...base,
    insights,
  };

  if (opts.visitorActions >= 2) {
    out.operationalTeaser =
      out.operationalTeaser ??
      OPERATIONAL_TEASERS[opts.visitorActions % OPERATIONAL_TEASERS.length]!;
  }

  if (opts.isLanding && opts.visitorActions >= 2) {
    out.navigatorChips = [
      { label: "Hero'ya dön", href: "/#tugobo-hero" },
      { label: "Kurulum görüşmesi", href: "/#tugobo-demo-talep" },
      { label: "Canlı ürün önizlemesi", href: DEMO_ACCESS_LANDING_HREF },
    ];
  }

  if (opts.visitorActions >= 4) {
    const proof = [
      "7/24 operasyon katmanı",
      "Birleşik misafir iletişimi",
      "Direkt rezervasyon altyapısı",
      "Operasyonel görünürlük",
      "İnsan devralma",
      "Türkçe + çok dilli",
    ];
    for (const p of proof) {
      if (!insights.includes(p)) insights.push(p);
    }
    out.insights = insights.slice(0, 5);
  }

  if (opts.visitorActions >= 3) {
    out.consultativeLine = out.consultativeLine
      ? `${out.consultativeLine}\n\n${ESCALATION_AFTER_3}`
      : ESCALATION_AFTER_3;
  }
  if (opts.visitorActions >= 5) {
    out.consultativeLine = out.consultativeLine
      ? `${out.consultativeLine}\n\n${ESCALATION_AFTER_5}`
      : ESCALATION_AFTER_5;
  }

  return out;
}

const TRUST_INSIGHTS = [
  "7/24 operasyon katmanı",
  "Birleşik misafir iletişimi",
  "Direkt rezervasyon altyapısı",
  "Operasyonel görünürlük",
  "İnsan devralma",
  "Türkçe + çok dilli",
] as const;

function dashboardSalesLinks(pathname: string): DashboardCtaLink[] {
  const entry: DashboardCtaLink =
    pathname === "/"
      ? { label: "Canlı ürün önizlemesi", href: DEMO_ACCESS_LANDING_HREF }
      : { label: "Örnek operasyon paneli", href: PUBLIC_DEMO_PANEL };
  return [
    entry,
    { label: "Konuşma operasyonu", href: `${PUBLIC_DEMO_PANEL}/conversations` },
    { label: "Direkt rezervasyon akışı", href: `${PUBLIC_DEMO_PANEL}/reservations` },
  ];
}

function consultLineForEntryFlow(flow: FlowId): string | undefined {
  switch (flow) {
    case "how_it_works":
      return "Misafir tarafındaki deneyim, otelinizin politikalarına ve kanal kurallarına göre Digital Hotel Operating System içinde şekillenir.";
    case "dashboard":
      return "Panel; konuşma hacmi, pipeline ve devralma akışını Hotel Operating Intelligence ile tek bakışta toparlar.";
    case "fit":
      return "İşletme profilinize göre kurulum kapsamı, entegrasyonlar ve ekip eğitimi netleştirilebilir.";
    case "demo":
      return undefined;
  }
}

const GENERIC_FREE_TEXT_REPLY =
  "Talebinizi aldım. Tugobo AI, **birleşik misafir iletişimini**, **operasyonel görünürlüğü** ve **direkt rezervasyon altyapısını** tek Digital Hotel Operating System katmanında birleştirir. İsterseniz **platform akışını** veya **operasyon panelini** nasıl kullanacağınızı özetleyebilirim.";

const DEMO_MAIL_HREF =
  "mailto:hello@tugobo.ai?subject=" +
  encodeURIComponent("Tugobo AI — Digital Hotel Operating System kurulum görüşmesi") +
  "&body=" +
  encodeURIComponent("Merhaba,\n\nTugobo AI Digital Hotel Operating System için kurulum / operasyon turu talep ediyorum.\n\nTeşekkürler,\n");

/** Same asset as marketing nav / homepage (`nav.tsx`, `page.tsx`). */
const FULL_LOGO_SRC = "/Logo.png";

/** Horizontal homepage wordmark; `object-contain`, not cropped. */
function ChatFullLogo({
  variant,
  className,
}: {
  variant: "header" | "fab";
  className?: string;
}) {
  const box =
    variant === "header"
      ? "relative h-[38px] w-[124px] max-sm:h-[34px] max-sm:w-[100px] shrink-0"
      : "relative h-[34px] w-[104px] shrink-0 sm:h-[36px] sm:w-[118px]";

  return (
    <div className={[box, className ?? ""].filter(Boolean).join(" ")}>
      <Image
        src={FULL_LOGO_SRC}
        alt=""
        fill
        sizes={variant === "header" ? "(max-width:640px)100px,128px" : "(max-width:640px)104px,120px"}
        className="object-contain object-left"
        priority={variant === "fab" || variant === "header"}
      />
    </div>
  );
}

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
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const demoTimersRef = useRef<number[]>([]);
  const visitorActionsRef = useRef(0);
  const flowContextRef = useRef<FlowState | null>(null);
  const salesDemoPhaseRef = useRef<SalesDemoPhase>("idle");
  const salesDemoSeqRef = useRef(0);
  const messagesRef = useRef<ChatMessage[]>([]);
  const intelRequestIdRef = useRef(0);
  const intelligenceAbortRef = useRef<AbortController | null>(null);

  const lastAssistantLabel = useMemo(() => "Tugobo AI", []);
  const isVisibleRoute =
    pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith(PUBLIC_DEMO_PANEL);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const openDemoModal = useOpenDemoModal();
  const openDemoAccessModal = useOpenDemoAccessModal();

  const getDashboardLinks = useCallback((): DashboardCtaLink[] => {
    if (pathname.startsWith("/dashboard")) {
      return [
        { label: "Operasyon özeti", href: "/dashboard" },
        { label: "Konuşma operasyonu", href: "/dashboard/conversations" },
        { label: "Direkt rezervasyon akışı", href: "/dashboard/reservations" },
      ];
    }
    if (pathname.startsWith(PUBLIC_DEMO_PANEL)) {
      return [
        { label: "Özet", href: PUBLIC_DEMO_PANEL },
        { label: "Konuşmalar", href: `${PUBLIC_DEMO_PANEL}/conversations` },
        { label: "Rezervasyonlar", href: `${PUBLIC_DEMO_PANEL}/reservations` },
      ];
    }
    return [
      { label: "Canlı ürün önizlemesi", href: DEMO_ACCESS_LANDING_HREF },
      { label: "Direkt rezervasyon akışı", href: `${PUBLIC_DEMO_PANEL}/reservations` },
      { label: "Konuşma operasyonu", href: `${PUBLIC_DEMO_PANEL}/conversations` },
    ];
  }, [pathname]);

  const wrapConversion = useCallback(
    (c: ConversionSurface | undefined) =>
      enrichConversion(c, { visitorActions: visitorActionsRef.current, isLanding: pathname === "/" }),
    [pathname]
  );

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
    const id = window.setTimeout(() => {
      if (!assistantTyping) inputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(id);
  }, [open, scrollToBottom, assistantTyping]);

  useLayoutEffect(() => {
    if (!open) return;
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, assistantTyping, open]);

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
      demoTimersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const resetTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const clearDemoTimers = useCallback(() => {
    demoTimersRef.current.forEach((id) => window.clearTimeout(id));
    demoTimersRef.current = [];
  }, []);

  const pushTimer = useCallback((id: number) => {
    timersRef.current.push(id);
  }, []);

  /** Typing bubble visible, then randomized 1–2.5s pause, then assistant message */
  const withTyping = useCallback(
    (runAfter: () => void) => {
      resetTimers();
      setAssistantTyping(true);
      const delay = randomAssistantDelayMs();
      const t = window.setTimeout(() => {
        setAssistantTyping(false);
        runAfter();
      }, delay);
      pushTimer(t);
    },
    [pushTimer, resetTimers]
  );

  const appendVisitor = useCallback((text: string, opts?: { visitorAttribution?: string }) => {
    visitorActionsRef.current += 1;
    const msg: ChatMessage = {
      id: nowId("visitor"),
      role: "visitor",
      text,
      ts: Date.now(),
      ...(opts?.visitorAttribution ? { visitorAttribution: opts.visitorAttribution } : {}),
    };
    setMessages((m) => [...m, msg]);
  }, []);

  const appendSystemEventLine = useCallback((text: string, tone: SystemTone = "event") => {
    const msg: ChatMessage = {
      id: nowId("system"),
      role: "system",
      text,
      ts: Date.now(),
      systemTone: tone,
    };
    setMessages((m) => [...m, msg]);
  }, []);

  const appendAssistant = useCallback((partial: Omit<ChatMessage, "id" | "role" | "ts"> & { text: string }) => {
    const msg: ChatMessage = {
      id: nowId("assistant"),
      role: "assistant",
      ts: Date.now(),
      ...partial,
    };
    setMessages((m) => [...m, msg]);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    setMessages((prev) => {
      if (!isDefaultWelcome(prev)) return prev;
      return applyLandingWelcomeCopy(prev);
    });
  }, [pathname]);

  const appendScenarioAssistant = useCallback(
    (p: ScenarioAssistantPayload, conversion?: ConversionSurface) => {
      appendAssistant({
        text: p.text,
        chips: p.chips,
        conversion:
          conversion ??
          wrapConversion({
            insights: p.chips?.length
              ? p.chips.slice(0, 3).map((c) => c.label)
              : [...TRUST_INSIGHTS].slice(0, 3),
            dashboardLinks: getDashboardLinks(),
            demoMailCta: true,
          }),
      });
    },
    [appendAssistant, getDashboardLinks, wrapConversion]
  );

  const runSalesDemoLines = useCallback(
    (lines: SalesDemoScriptLine[], startIndex: number, onComplete?: () => void) => {
      const runNext = (idx: number) => {
        if (idx >= lines.length) {
          onComplete?.();
          return;
        }
        const line = lines[idx]!;
        if (line.kind === "system") {
          appendSystemEventLine(line.text, line.tone);
          const t = window.setTimeout(() => runNext(idx + 1), line.delayAfterMs);
          demoTimersRef.current.push(t);
          return;
        }
        if (line.kind === "visitor") {
          appendVisitor(line.text, { visitorAttribution: "Misafir (örnek)" });
          const t = window.setTimeout(() => runNext(idx + 1), line.delayAfterMs);
          demoTimersRef.current.push(t);
          return;
        }
        setAssistantTyping(true);
        const d = randomAssistantDelayMs();
        const t1 = window.setTimeout(() => {
          setAssistantTyping(false);
          appendAssistant({
            text: line.text,
            chips: line.chips,
            pricePreview: line.pricePreview,
            reservationPreview: line.reservationPreview,
            conversion: line.reservationPreview
              ? wrapConversion({
                  consultativeLine:
                    "Bu özet kartı, operasyon panelindeki **rezervasyon bandı** ve **tahsilat satırı** ile aynı çizelgede görünür.",
                  insights: ["Pipeline", "Ödeme bandı", "İnsan devralma", "Doğrudan kanal"],
                  dashboardLinks: dashboardSalesLinks(pathname),
                  demoMailCta: false,
                })
              : wrapConversion({
                  consultativeLine: "Önizleme ortamı — tarih, tutar ve misafir satırları gösterim amaçlıdır.",
                  insights: [...TRUST_INSIGHTS].slice(0, 4),
                  dashboardLinks: getDashboardLinks(),
                  demoMailCta: false,
                }),
          });
          const t2 = window.setTimeout(() => runNext(idx + 1), line.delayAfterMs);
          demoTimersRef.current.push(t2);
        }, d);
        demoTimersRef.current.push(t1);
      };
      runNext(startIndex);
    },
    [appendAssistant, appendSystemEventLine, appendVisitor, getDashboardLinks, pathname, wrapConversion]
  );

  const handleReservationCta = useCallback(
    (id: string) => {
      if (id === "demo_dash") {
        if (pathname === "/") {
          openDemoAccessModal();
        } else {
          window.location.href = PUBLIC_DEMO_PANEL;
        }
        return;
      }
      if (id === "demo_pay_pending" && salesDemoPhaseRef.current === "await_pay") {
        salesDemoPhaseRef.current = "await_confirm";
        clearDemoTimers();
        runSalesDemoLines(SALES_DEMO_PAYMENT_PENDING, 0, () => {});
        return;
      }
    },
    [clearDemoTimers, openDemoAccessModal, pathname, runSalesDemoLines]
  );

  const runHotelIntelligence = useCallback(
    async (prebuiltMessages: IntelligenceChatRequest["messages"]) => {
      const reqId = ++intelRequestIdRef.current;
      intelligenceAbortRef.current?.abort();
      const ctrl = new AbortController();
      intelligenceAbortRef.current = ctrl;
      resetTimers();
      setAssistantTyping(true);
      try {
        const result = await fetchIntelligenceChat(prebuiltMessages, ctrl.signal);
        if (reqId !== intelRequestIdRef.current) return;
        if (result.ok && result.data.enabled && result.data.reply) {
          const insightChips = mapInsightsToChipLabels(result.data.insights ?? undefined);
          appendAssistant({
            text: result.data.reply,
            hotelInsights: result.data.insights ?? undefined,
            conversion: wrapConversion({
              consultativeLine:
                "Yanıt **Hotel Operating Intelligence** katmanı (DeepSeek) ile üretildi; canlı kurulumda politika ve veri bağlantılarınız eklenir.",
              insights: insightChips.length > 0 ? insightChips : [...TRUST_INSIGHTS].slice(0, 3),
              dashboardLinks: getDashboardLinks(),
              demoMailCta: true,
            }),
          });
          return;
        }
        appendAssistant({
          text: GENERIC_FREE_TEXT_REPLY,
          conversion: wrapConversion({
            consultativeLine:
              "Canlı AI katmanı için **DEEPSEEK_API_KEY** sunucu ortamında tanımlı olmalıdır; anahtar tarayıcıya verilmez.",
            insights: [...TRUST_INSIGHTS],
            dashboardLinks: getDashboardLinks(),
            demoMailCta: true,
          }),
        });
      } catch {
        if (reqId !== intelRequestIdRef.current) return;
        appendAssistant({
          text: GENERIC_FREE_TEXT_REPLY,
          conversion: wrapConversion({
            consultativeLine:
              "Şu an canlı AI katmanına ulaşılamadı. Önizleme akışları veya kurulum görüşmesi ile devam edebilirsiniz.",
            insights: [...TRUST_INSIGHTS],
            dashboardLinks: getDashboardLinks(),
            demoMailCta: true,
          }),
        });
      } finally {
        if (reqId === intelRequestIdRef.current) {
          setAssistantTyping(false);
        }
      }
    },
    [appendAssistant, getDashboardLinks, resetTimers, wrapConversion]
  );

  const sendFreeText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      intelligenceAbortRef.current?.abort();
      if (salesDemoPhaseRef.current !== "idle" && !detectSalesDemoIntent(trimmed)) {
        clearDemoTimers();
        salesDemoPhaseRef.current = "idle";
      }

      setInput("");
      resetTimers();
      setAssistantTyping(false);

      if (detectSalesDemoIntent(trimmed)) {
        appendVisitor(trimmed);
        flowContextRef.current = null;
        clearDemoTimers();
        salesDemoPhaseRef.current = "opening";
        runSalesDemoLines(SALES_DEMO_OPENING_SCRIPT, 0, () => {
          salesDemoPhaseRef.current = "await_pay";
        });
        return;
      }

      appendVisitor(trimmed);
      bridgeWebChatToPanel(trimmed);

      const routed = detectFlowFromUserText(trimmed);
      if (routed) {
        flowContextRef.current = { flow: routed, step: 0 };
        const entry = getScenarioEntryPayload(routed);
        withTyping(() => {
          if (routed === "demo") {
            appendScenarioAssistant(
              entry,
              wrapConversion({
                insights: [...TRUST_INSIGHTS],
                dashboardLinks: getDashboardLinks(),
                navigatorChips: [
                  { label: "Kurulum formu (sayfa)", href: "/#tugobo-demo-talep" },
                  { label: "Canlı ürün önizlemesi", href: DEMO_ACCESS_LANDING_HREF },
                ],
                demoMailCta: true,
              })
            );
            openDemoModal();
            flowContextRef.current = null;
            return;
          }
          if (routed === "dashboard") {
            appendScenarioAssistant(
              entry,
              wrapConversion({
                consultativeLine: consultLineForEntryFlow("dashboard"),
                insights: [...TRUST_INSIGHTS],
                dashboardLinks: dashboardSalesLinks(pathname),
                demoMailCta: true,
              })
            );
            return;
          }
          appendScenarioAssistant(
            entry,
            wrapConversion({
              consultativeLine: consultLineForEntryFlow(routed),
              insights: [...TRUST_INSIGHTS],
              dashboardLinks: getDashboardLinks(),
              demoMailCta: true,
            })
          );
        });
        return;
      }

      const ctx = flowContextRef.current;
      if (ctx) {
        const adv = advanceScenario(ctx, trimmed);
        if (adv) {
          flowContextRef.current = adv.next;
          withTyping(() => {
            appendScenarioAssistant(
              adv.reply,
              wrapConversion({
                consultativeLine:
                  "Canlı kurulumda içerik, fiyat ve politikalar otelinizin gerçek verisine bağlanır.",
                insights: [...TRUST_INSIGHTS],
                dashboardLinks: getDashboardLinks(),
                demoMailCta: true,
              })
            );
          });
          return;
        }
        flowContextRef.current = null;
      }

      const prebuilt = buildIntelligenceRequestMessages(messagesRef.current, trimmed);
      void runHotelIntelligence(prebuilt);
      return;
    },
    [
      appendAssistant,
      appendScenarioAssistant,
      appendVisitor,
      clearDemoTimers,
      getDashboardLinks,
      openDemoModal,
      resetTimers,
      runHotelIntelligence,
      runSalesDemoLines,
      withTyping,
      wrapConversion,
    ]
  );

  const handleScenarioChip = useCallback(
    (label: string) => {
      resetTimers();
      intelligenceAbortRef.current?.abort();
      setAssistantTyping(false);
      appendVisitor(label);
      const low = label.toLocaleLowerCase("tr-TR");

      if (
        salesDemoPhaseRef.current === "await_pay" &&
        (low.includes("ödeme beklemede") || low.includes("odeme beklemede"))
      ) {
        clearDemoTimers();
        salesDemoPhaseRef.current = "await_confirm";
        runSalesDemoLines(SALES_DEMO_PAYMENT_PENDING, 0, () => {});
        return;
      }
      if (
        salesDemoPhaseRef.current === "await_confirm" &&
        (low.includes("resepsiyon onayı") || low.includes("resepsiyon onayi"))
      ) {
        clearDemoTimers();
        runSalesDemoLines(SALES_DEMO_CONFIRMED, 0, () => {
          salesDemoPhaseRef.current = "done";
          salesDemoSeqRef.current += 1;
          window.dispatchEvent(
            new CustomEvent(TUGOBO_SALES_DEMO_EVENT, {
              detail: salesDemoMetricsPayload(salesDemoSeqRef.current),
            })
          );
        });
        return;
      }

      if (
        low.includes("kurulum formunu") ||
        low.includes("görüşme formunu") ||
        low.includes("gorusme formunu") ||
        low.includes("ücretsiz görüşme formu") ||
        low.includes("demo talep") ||
        low.includes("görüşme talep") ||
        low.includes("gorusme talep") ||
        low.includes("demo plan") ||
        low.includes("görüşme plan")
      ) {
        withTyping(() => {
          appendAssistant({
            text: "Tamam — **kurulum görüşmesi formunu** açıyorum. Kısa bilgilerinizi iletmeniz yeterli; ekibimiz operasyon turu için size döner.",
            conversion: wrapConversion({
              insights: [...TRUST_INSIGHTS],
              dashboardLinks: getDashboardLinks(),
              demoMailCta: true,
            }),
          });
          openDemoModal();
        });
        flowContextRef.current = null;
        return;
      }

      if (
        low.includes("önce operasyon") ||
        low.includes("once operasyon") ||
        low.includes("paneli göster") ||
        low.includes("paneli goster") ||
        (low.includes("dashboard") && !low.includes("görüşme talep") && !low.includes("gorusme talep"))
      ) {
        flowContextRef.current = { flow: "dashboard", step: 0 };
        withTyping(() => {
          const dash = getScenarioEntryPayload("dashboard");
          appendScenarioAssistant(
            dash,
            wrapConversion({
              consultativeLine: "Bu ekranlar operasyon önizlemesidir; canlı veriler kurulumla gelir.",
              insights: [...TRUST_INSIGHTS],
              dashboardLinks: dashboardSalesLinks(pathname),
              demoMailCta: true,
            })
          );
        });
        return;
      }

      const ctx = flowContextRef.current;
      if (ctx) {
        const adv = advanceScenario(ctx, label);
        if (adv) {
          flowContextRef.current = adv.next;
          withTyping(() => {
            appendScenarioAssistant(
              adv.reply,
              wrapConversion({
                consultativeLine:
                  "Bu anlatım önizleme amaçlıdır; canlıda kanal ve politika kurallarınız uygulanır.",
                insights: [...TRUST_INSIGHTS],
                dashboardLinks: getDashboardLinks(),
                demoMailCta: true,
              })
            );
          });
          return;
        }
      }

      const prebuilt = buildIntelligenceRequestMessages(messagesRef.current, label);
      void runHotelIntelligence(prebuilt);
    },
    [
      appendAssistant,
      appendScenarioAssistant,
      appendVisitor,
      clearDemoTimers,
      getDashboardLinks,
      openDemoModal,
      resetTimers,
      runHotelIntelligence,
      runSalesDemoLines,
      withTyping,
      wrapConversion,
    ]
  );

  const runQuickAction = useCallback(
    (action: QuickAction["id"]) => {
      resetTimers();
      clearDemoTimers();
      intelligenceAbortRef.current?.abort();
      setAssistantTyping(false);

      if (action === "sales_live_demo") {
        flowContextRef.current = null;
        appendVisitor("Canlı rezervasyon ve operasyon demosunu başlatmak istiyorum.");
        salesDemoPhaseRef.current = "opening";
        runSalesDemoLines(SALES_DEMO_OPENING_SCRIPT, 0, () => {
          salesDemoPhaseRef.current = "await_pay";
        });
        return;
      }

      salesDemoPhaseRef.current = "idle";

      flowContextRef.current =
        action === "demo" ? { flow: "demo", step: 0 } : { flow: action, step: 0 };

      const visitorLine =
        action === "how_it_works"
          ? "Digital Hotel Operating System nasıl çalışır?"
          : action === "dashboard"
            ? "Operasyon panelini görmek istiyorum."
            : action === "fit"
              ? "İşletmem için Tugobo uygunluğunu değerlendirmek istiyorum."
              : "Kurulum görüşmesi planlamak istiyorum.";
      appendVisitor(visitorLine);

      if (action === "demo") {
        const entry = getScenarioEntryPayload("demo");
        withTyping(() => {
          appendScenarioAssistant(
            entry,
            wrapConversion({
              insights: [...TRUST_INSIGHTS],
              dashboardLinks: getDashboardLinks(),
              navigatorChips: [
                  { label: "Kurulum formu (sayfa)", href: "/#tugobo-demo-talep" },
                  { label: "Canlı ürün önizlemesi", href: DEMO_ACCESS_LANDING_HREF },
                ],
              demoMailCta: true,
            })
          );
          openDemoModal();
          flowContextRef.current = null;
        });
        return;
      }

      if (action === "dashboard") {
        const entry = getScenarioEntryPayload("dashboard");
        withTyping(() => {
          appendScenarioAssistant(
            entry,
            wrapConversion({
              consultativeLine: consultLineForEntryFlow("dashboard"),
              insights: [...TRUST_INSIGHTS],
              dashboardLinks: dashboardSalesLinks(pathname),
              demoMailCta: true,
            })
          );
        });
        return;
      }

      const entry = getScenarioEntryPayload(action);
      withTyping(() => {
        appendScenarioAssistant(
          entry,
          wrapConversion({
            consultativeLine: consultLineForEntryFlow(action),
            insights: [...TRUST_INSIGHTS],
            dashboardLinks: getDashboardLinks(),
            demoMailCta: true,
          })
        );
      });
    },
    [
      appendScenarioAssistant,
      appendVisitor,
      clearDemoTimers,
      getDashboardLinks,
      openDemoModal,
      resetTimers,
      runSalesDemoLines,
      withTyping,
      wrapConversion,
    ]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (assistantTyping) return;
    sendFreeText(input);
  }

  function onQuickAction(a: QuickAction) {
    if (!open) setOpen(true);
    runQuickAction(a.id);
  }

  if (!mounted || !isVisibleRoute) return null;

  return createPortal(
    <>
      <div className={["fixed bottom-6 right-6 pointer-events-auto z-[9999]"].join(" ")}>
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label={open ? "Paneli kapat" : "Tugobo operasyon rehberini aç"}
          className={[
            "group relative",
            "flex items-center gap-3",
            "rounded-xl",
            "px-3 py-2.5 sm:px-4 sm:py-3",
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
          <span className="absolute -inset-0.5 rounded-[18px] bg-gradient-to-r from-blue-500/[0.14] via-violet-500/[0.12] to-emerald-500/[0.10] blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-shimmer-soft" />
          <span className="absolute -inset-px rounded-[18px] bg-white/[0.02]" />

          <span className="relative shrink-0">
            <ChatFullLogo variant="fab" />
            <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500 animate-live-pulse" />
          </span>

          <span className="relative flex min-w-0 flex-col items-start gap-0.5 leading-tight">
            <span className="text-[13px] font-semibold tracking-tight text-white/90">Tugobo AI</span>
            <span className="max-w-[14rem] truncate text-[11px] text-white/40 sm:max-w-[16rem]">
              Hotel Operating Intelligence
            </span>
          </span>

          <span className="relative ml-2 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/45 group-hover:text-white/70 transition-colors w-9 h-9">
            <MessageSquare className="w-4 h-4" />
          </span>
        </button>
      </div>

      <div
        className={[
          "fixed right-6 bottom-24 z-[10000] flex flex-col xl:right-8",
          "w-[min(380px,calc(100vw-40px))]",
          "h-[min(560px,calc(100vh-140px))]",
          "max-sm:top-28 max-sm:left-3 max-sm:right-3 max-sm:bottom-4 max-sm:w-auto max-sm:h-[min(480px,calc(100dvh-8.5rem))]",
          "transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-3 scale-[0.985] pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-label="Tugobo operasyon rehberi"
      >
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/[0.14] bg-zinc-950/90 backdrop-blur-3xl shadow-[0_32px_70px_-14px_rgba(0,0,0,0.78),0_16px_32px_-8px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_30%_0%,rgba(59,130,246,0.10),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_25%,rgba(139,92,246,0.08),transparent_60%)]" />
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(to_bottom,rgba(10,10,10,0.92),rgba(5,5,5,0.96))]"
            aria-hidden
          />

          <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-white/[0.06] bg-zinc-950/40 px-5 py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <ChatFullLogo variant="header" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500 animate-live-pulse" aria-hidden />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <span className="truncate text-[13px] font-semibold leading-snug text-white/90">Tugobo AI</span>
                  <span className="truncate text-[11px] leading-snug text-white/40">Hotel Operating Intelligence</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl p-2 text-white/35 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/70 cursor-pointer"
                    aria-label="Kapat"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </header>

            <div className="shrink-0 border-b border-white/[0.04] px-5 py-3">
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
                      "transition-all duration-200 active:scale-[0.98] cursor-pointer",
                    ].join(" ")}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 tugobo-chat-scroll"
            >
              <div className="flex flex-col space-y-4 pb-10">
                {messages.map((m) => {
                  if (m.role === "system") {
                    return <SystemLine key={m.id} text={m.text} tone={m.systemTone ?? "banner"} />;
                  }
                  return (
                    <MessageBubble
                      key={m.id}
                      role={m.role}
                      text={m.text}
                      meta={
                        m.role === "assistant"
                          ? `${lastAssistantLabel} · ${formatTime(m.ts)}`
                          : `${m.visitorAttribution ?? "Siz"} · ${formatTime(m.ts)}`
                      }
                      chips={m.chips}
                      pricePreview={m.pricePreview}
                      reservationPreview={m.reservationPreview}
                      conversion={m.conversion}
                      hotelInsights={m.hotelInsights}
                      onChipPick={handleScenarioChip}
                      onReservationCta={handleReservationCta}
                    />
                  );
                })}

                {assistantTyping && (
                  <div className="flex justify-start animate-tugobo-chat-msg">
                    <div
                      className="relative rounded-2xl rounded-bl-md border border-white/[0.10] bg-white/[0.045] px-4 py-3 shadow-[0_0_24px_-4px_rgba(59,130,246,0.22)]"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <span className="sr-only">Yanıt hazırlanıyor</span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-300/80 shadow-[0_0_8px_rgba(96,165,250,0.55)] animate-typing-dot [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-blue-300/80 shadow-[0_0_8px_rgba(96,165,250,0.55)] animate-typing-dot [animation-delay:200ms]" />
                        <span className="h-2 w-2 rounded-full bg-blue-300/80 shadow-[0_0_8px_rgba(96,165,250,0.55)] animate-typing-dot [animation-delay:400ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollEndRef} className="h-px w-full shrink-0" aria-hidden />
              </div>
            </div>

            <p className="px-5 pt-2 pb-1 text-center text-[10px] leading-snug text-white/28">
              Önizleme ortamı · Canlı kurulumda tam entegrasyon ve veri bağlantısı aktifleşir.
            </p>
            <form
              onSubmit={onSubmit}
              className="shrink-0 border-t border-white/[0.06] bg-zinc-950/70 backdrop-blur-xl px-5 py-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Operasyon, kanallar veya kurulum hakkında sorun..."
                    disabled={assistantTyping}
                    className={[
                      "w-full h-11 px-4 rounded-2xl",
                      "bg-white/[0.04] border border-white/[0.09]",
                      "text-[13px] text-white/85 placeholder:text-white/25",
                      "focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06]",
                      "transition-all duration-200",
                      assistantTyping ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || assistantTyping}
                  className={[
                    "h-11 w-11 shrink-0 rounded-2xl",
                    "flex items-center justify-center",
                    "bg-blue-600/90 hover:bg-blue-600",
                    "border border-blue-500/40",
                    "text-white",
                    "transition-all duration-200 active:scale-[0.98] cursor-pointer",
                    "disabled:opacity-40 disabled:hover:bg-blue-600/90 disabled:cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Gönder"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function SystemLine({ text, tone }: { text: string; tone: SystemTone }) {
  if (tone === "event") {
    return (
      <div className="flex justify-center py-1 animate-tugobo-chat-msg">
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
            "border border-amber-500/25 bg-amber-500/[0.08]",
            "text-[11px] font-medium text-amber-100/90",
          ].join(" ")}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90 animate-live-pulse" />
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="animate-tugobo-chat-msg pt-0.5">
      <p className="text-left text-[11px] leading-relaxed text-white/35">{text}</p>
    </div>
  );
}

function MiniPriceRecommendation({ preview }: { preview: PricePreview }) {
  return (
    <div className="mt-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.07] to-blue-500/[0.05] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35 mb-2">Örnek öneri</p>
      <div className="space-y-1.5">
        <p className="text-[13px] font-semibold text-white/90">{preview.roomLabel}</p>
        <p className="text-[12px] text-white/55">{preview.guestsLabel}</p>
        <p className="text-[12px] text-white/55">{preview.nightsLabel}</p>
        <div className="pt-2 mt-1 border-t border-white/[0.08]">
          <p className="text-[12px] font-semibold text-white/88">{preview.totalLabel}</p>
          <p className="text-[10px] text-white/35 mt-1">Gösterim amaçlı örnek tutar; canlı fiyatlar tarihe göre değişir.</p>
        </div>
      </div>
    </div>
  );
}

function ReservationInlineCard({
  preview,
  onCta,
}: {
  preview: ReservationPreview;
  onCta: (id: string) => void;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-zinc-900/50 to-blue-500/[0.05] px-3.5 py-3.5 shadow-[0_0_32px_-10px_rgba(16,185,129,0.28)]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/55">Ön rezervasyon</p>
        <span className="text-[10px] font-medium text-white/35 tabular-nums">{preview.dateRangeLabel}</span>
      </div>
      <p className="text-[14px] font-semibold text-white/92 leading-snug">{preview.roomName}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-white/55">
        <span>{preview.nights} gece</span>
        <span className="text-white/20">·</span>
        <span>{preview.guests} kişi</span>
      </div>
      <div className="mt-3 pt-2.5 border-t border-white/[0.08]">
        <p className="text-[15px] font-bold text-white tabular-nums">{preview.totalLabel}</p>
        {preview.subtitle ? (
          <p className="text-[10px] text-white/38 mt-1 leading-relaxed">{preview.subtitle}</p>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {preview.ctas.map((cta) => (
          <button
            key={cta.id}
            type="button"
            onClick={() => onCta(cta.id)}
            className={[
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-200 active:scale-[0.98]",
              cta.id === "reserve_pay"
                ? "bg-blue-600/95 text-white border border-blue-500/40 hover:bg-blue-500"
                : "bg-white/[0.06] text-white/75 border border-white/[0.12] hover:bg-white/[0.10] hover:text-white/90",
            ].join(" ")}
          >
            {cta.id === "reserve_pay" ? (
              <CreditCard className="w-3.5 h-3.5 opacity-90" aria-hidden />
            ) : (
              <FileText className="w-3.5 h-3.5 opacity-80" aria-hidden />
            )}
            {cta.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConversionAttachments({ surface }: { surface: ConversionSurface }) {
  const has =
    Boolean(surface.consultativeLine) ||
    Boolean(surface.operationalTeaser) ||
    (surface.navigatorChips && surface.navigatorChips.length > 0) ||
    (surface.insights && surface.insights.length > 0) ||
    (surface.dashboardLinks && surface.dashboardLinks.length > 0) ||
    Boolean(surface.demoMailCta);
  if (!has) return null;
  return (
    <div className="mt-3 max-w-full space-y-3 animate-tugobo-chat-msg [animation-delay:95ms] [animation-fill-mode:both]">
      {surface.consultativeLine ? <ConsultativeAside text={surface.consultativeLine} /> : null}
      {surface.operationalTeaser ? <OperationalTeaser text={surface.operationalTeaser} /> : null}
      {surface.navigatorChips && surface.navigatorChips.length > 0 ? (
        <NavigatorChipsRow chips={surface.navigatorChips} />
      ) : null}
      {surface.insights && surface.insights.length > 0 ? <InsightStrip items={surface.insights} /> : null}
      {surface.dashboardLinks && surface.dashboardLinks.length > 0 ? (
        <DashboardPreviewStrip links={surface.dashboardLinks} />
      ) : null}
      {surface.demoMailCta ? <DemoSoftEscalation /> : null}
    </div>
  );
}

function OperationalTeaser({ text }: { text: string }) {
  return (
    <p className="text-[11px] leading-relaxed text-white/40 border border-white/[0.06] rounded-xl bg-white/[0.02] px-3 py-2">
      {text}
    </p>
  );
}

function NavigatorChipsRow({ chips }: { chips: DashboardCtaLink[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <Link
          key={c.href + c.label}
          href={c.href}
          className="inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white/78 active:scale-[0.98]"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

function ConsultativeAside({ text }: { text: string }) {
  return (
    <p className="text-[12px] leading-relaxed text-white/52 border-l-2 border-emerald-500/20 pl-3 py-0.5 whitespace-pre-wrap">
      {text}
    </p>
  );
}

function InsightStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[11px] font-medium text-white/44 tracking-tight"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function DashboardPreviewStrip({ links }: { links: DashboardCtaLink[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-zinc-950/50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/32 mb-2">Operasyon adımları</p>
      <div className="flex flex-col gap-1.5">
        {links.map((l) => (
          <Link
            key={l.href + l.label}
            href={l.href}
            className="group flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[12px] font-medium text-white/78 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/92 active:scale-[0.99]"
          >
            <span className="min-w-0 leading-snug">{l.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/28 transition-colors duration-200 group-hover:text-blue-300/80" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function DemoSoftEscalation() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
      <a
        href={DEMO_MAIL_HREF}
        className="text-[12px] leading-snug text-blue-200/72 transition-colors duration-200 hover:text-blue-100/90 underline-offset-4 hover:underline"
      >
        Uygun olduğunuz bir zaman için Digital Hotel Operating System kurulum görüşmesi planlamak isterseniz buradan yazabilirsiniz.
      </a>
    </div>
  );
}

function IntelligenceInsightPanel({ insights }: { insights: HotelIntelligenceInsights }) {
  const rows: { label: string; value: string }[] = [];
  if (insights.leadIntent) {
    const labels: Record<string, string> = {
      booking: "Rezervasyon / gelir",
      information: "Bilgi",
      pricing: "Fiyat / teklif",
      complaint: "Şikâyet / risk",
      other: "Genel",
    };
    rows.push({ label: "Niyet", value: labels[insights.leadIntent] ?? insights.leadIntent });
  }
  if (typeof insights.urgencyScore === "number") {
    rows.push({ label: "Aciliyet skoru", value: `${insights.urgencyScore}/100` });
  }
  if (insights.takeoverRecommended === true) {
    rows.push({ label: "İnsan devralma", value: "Önerilir" });
  }
  if (typeof insights.reservationLikelihood === "number") {
    rows.push({ label: "Direkt rezervasyon olasılığı", value: `${insights.reservationLikelihood}/100` });
  }
  if (insights.nextBestAction) {
    rows.push({ label: "Sonraki en iyi aksiyon", value: insights.nextBestAction });
  }
  if (rows.length === 0) return null;
  return (
    <div className="mt-2.5 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/[0.08] to-violet-500/[0.05] px-3 py-2.5 shadow-[0_0_24px_-8px_rgba(59,130,246,0.25)]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200/70 mb-2 flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 shrink-0" aria-hidden />
        Operasyon içgörüsü (AI)
      </p>
      <dl className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
            <dt className="text-[10px] font-medium text-white/35 shrink-0">{r.label}</dt>
            <dd className="text-[11px] text-white/78 leading-snug sm:text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[9px] text-white/28 mt-2 leading-snug">
        Tahmine dayalı sinyaller; canlı kurulumda PMS ve politika verisiyle keskinleşir.
      </p>
    </div>
  );
}

function MessageBubble({
  role,
  text,
  meta,
  chips,
  pricePreview,
  reservationPreview,
  conversion,
  hotelInsights,
  onChipPick,
  onReservationCta,
}: {
  role: "assistant" | "visitor";
  text: string;
  meta: string;
  chips?: QuickChip[];
  pricePreview?: PricePreview;
  reservationPreview?: ReservationPreview;
  conversion?: ConversionSurface;
  hotelInsights?: HotelIntelligenceInsights | null;
  onChipPick: (label: string) => void;
  onReservationCta?: (id: string) => void;
}) {
  const isAI = role === "assistant";
  return (
    <div className={isAI ? "flex animate-tugobo-chat-msg justify-start" : "flex animate-tugobo-chat-msg justify-end"}>
      <div
        className={
          isAI
            ? "flex min-w-0 w-fit max-w-[82%] flex-col items-start"
            : "flex min-w-0 w-fit max-w-[82%] flex-col items-end"
        }
      >
        <div
          className={[
            "rounded-2xl border p-4",
            isAI
              ? "bg-white/[0.04] border-white/[0.08] rounded-bl-md"
              : "bg-blue-600 border-blue-500/30 rounded-br-md",
          ].join(" ")}
        >
          <RichText text={text} invert={isAI} />
        </div>

        {isAI && pricePreview && !reservationPreview && <MiniPriceRecommendation preview={pricePreview} />}

        {isAI && reservationPreview && onReservationCta ? (
          <ReservationInlineCard preview={reservationPreview} onCta={onReservationCta} />
        ) : null}

        {isAI && chips && chips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChipPick(c.label)}
                className={[
                  "px-2.5 py-1 rounded-full text-[11px] font-medium",
                  "bg-white/[0.04] border border-white/[0.10] text-white/65",
                  "hover:text-white/85 hover:border-white/[0.16] hover:bg-white/[0.06]",
                  "transition-all duration-200 active:scale-[0.98] cursor-pointer",
                ].join(" ")}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {isAI && hotelInsights ? <IntelligenceInsightPanel insights={hotelInsights} /> : null}

        {isAI && conversion ? <ConversionAttachments surface={conversion} /> : null}

        <div className={isAI ? "mt-2 self-start text-[10px] text-white/18" : "mt-2 self-end text-[10px] text-white/25"}>
          {meta}
        </div>
      </div>

      {!isAI && (
        <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <UserRound className="h-4 w-4 text-white/45" aria-hidden />
          <span className="sr-only">Siz</span>
        </div>
      )}
    </div>
  );
}

function RichText({ text, invert }: { text: string; invert: boolean }) {
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
    <p
      className={
        invert ? "text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap" : "text-[13px] text-white leading-relaxed whitespace-pre-wrap"
      }
    >
      {parts.map((p, i) =>
        p.b ? (
          <strong key={i} className="font-semibold text-white">
            {p.t}
          </strong>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </p>
  );
}
