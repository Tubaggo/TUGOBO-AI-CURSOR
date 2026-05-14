"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
  CalendarCheck,
  Banknote,
  ShieldCheck,
  ArrowUpRight,
  AlertTriangle,
  Globe,
  Instagram,
  MessageCircle,
  Sparkles,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  CONVERSATIONS,
  type Conversation,
  type ConversationChannel,
  type ConversationStatus,
} from "../_components/mock-data";
import {
  CHAT_THREADS,
  type ChatMsg,
  type ConvReservation,
  type ChatThread,
} from "../_components/chat-threads";
import { StatusBadge, LeadBadge, LanguageFlag } from "../_components/badges";
import { MessageRow, ChatTypingIndicator } from "@/app/dashboard/_components/chat";
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

// ─── ROI metrics (base values — updated live when reservations confirm) ───────

const BASE_METRICS = {
  bookings: 3,
  revenue: 4230,       // € — direct bookings via AI this week
  responseTime: "38s", // avg, vs. 4h industry average
  leadsAfterHours: 7,  // leads caught outside business hours
};

type OpsPhase =
  | "idle"
  | "triage"
  | "checking_availability"
  | "generating_offer"
  | "awaiting_payment"
  | "follow_up_scheduled";

const OPS_PHASES: {
  phase: OpsPhase;
  label: string;
  sub: string;
  icon: React.ElementType;
  wrap: string;
  text: string;
}[] = [
  {
    phase: "triage",
    label: "Triage",
    sub: "classifying intent + routing",
    icon: Sparkles,
    wrap: "bg-violet-500/10 border-violet-500/18",
    text: "text-violet-300/80",
  },
  {
    phase: "checking_availability",
    label: "Availability",
    sub: "checking room inventory",
    icon: RefreshCw,
    wrap: "bg-sky-500/10 border-sky-500/18",
    text: "text-sky-200/80",
  },
  {
    phase: "generating_offer",
    label: "Offer",
    sub: "generating best option",
    icon: Sparkles,
    wrap: "bg-blue-500/10 border-blue-500/18",
    text: "text-blue-200/80",
  },
  {
    phase: "awaiting_payment",
    label: "Payment",
    sub: "awaiting secure checkout",
    icon: CreditCard,
    wrap: "bg-amber-500/10 border-amber-500/18",
    text: "text-amber-200/80",
  },
  {
    phase: "follow_up_scheduled",
    label: "Follow-up",
    sub: "reminder scheduled",
    icon: CheckCheck,
    wrap: "bg-emerald-500/10 border-emerald-500/18",
    text: "text-emerald-200/80",
  },
];

// Static metric definitions (value is computed dynamically in MetricsBar)
const METRIC_DEFS = [
  {
    icon: CalendarCheck,
    key: "bookings" as const,
    label: "Direct bookings today",
    color: "text-emerald-400",
    iconBg: "bg-emerald-500/[0.12]",
    borderColor: "border-emerald-500/[0.10]",
  },
  {
    icon: TrendingUp,
    key: "revenue" as const,
    label: "Revenue recovered (direct)",
    color: "text-blue-400",
    iconBg: "bg-blue-500/[0.12]",
    borderColor: "border-blue-500/[0.10]",
  },
  {
    icon: Banknote,
    key: "ota" as const,
    label: "OTA commission saved",
    color: "text-amber-400",
    iconBg: "bg-amber-500/[0.12]",
    borderColor: "border-amber-500/[0.10]",
  },
  {
    icon: Zap,
    key: "response" as const,
    label: "Avg response time",
    color: "text-violet-400",
    iconBg: "bg-violet-500/[0.12]",
    borderColor: "border-violet-500/[0.10]",
  },
  {
    icon: ShieldCheck,
    key: "leads" as const,
    label: "Missed leads prevented",
    color: "text-cyan-400",
    iconBg: "bg-cyan-500/[0.12]",
    borderColor: "border-cyan-500/[0.10]",
  },
] as const;

// Simulated follow-up from Ahmet (c1) — triggers 8 seconds after page load
const INCOMING_MSG: ChatMsg = {
  id: "incoming-ahmet-followup",
  dir: "in",
  body: "Rezervasyon oluşturabilir miyiz? Fiyat için Süperiör oda uygun görünüyor.",
  time: "",
};

function channelLabel(ch?: ConversationChannel): string {
  if (ch === "instagram") return "Instagram";
  if (ch === "web") return "Web chat";
  return "WhatsApp";
}

function ChannelGlyph({
  channel,
  className,
}: {
  channel?: ConversationChannel;
  className?: string;
}) {
  const ch = channel ?? "whatsapp";
  if (ch === "instagram") {
    return <Instagram className={cn("text-pink-400/90", className)} aria-hidden />;
  }
  if (ch === "web") {
    return <Globe className={cn("text-sky-400/85", className)} aria-hidden />;
  }
  return <MessageCircle className={cn("text-emerald-400/90", className)} aria-hidden />;
}

// ─── Demo guest pool ──────────────────────────────────────────────────────────

type DemoGuest = {
  name: string; initials: string; avatarColor: string; phone: string;
  language: string; flag: string;
  inquiry: string; aiGreet: string; aiOffer: string; aiPaymentMsg: string; aiConfirm: string;
  room: string; checkIn: string; checkOut: string;
  nights: number; guestCount: number; pricePerNight: number; currency: string;
};

const DEMO_GUESTS: DemoGuest[] = [
  {
    name: "Sophie Martin", initials: "SM", avatarColor: "bg-rose-500", phone: "+33 6 12 34 56 78",
    language: "FR", flag: "🇫🇷",
    inquiry: "Bonjour! Je cherche une chambre double pour 2 personnes du 15 au 18 août. Avez-vous de la disponibilité?",
    aiGreet: "Bonjour Sophie! 😊 Bienvenue au Grand Hotel Demo. Je vérifie les disponibilités du 15 au 18 août pour vous…",
    aiOffer: "Excellente nouvelle! Pour vos dates, j'ai la disponibilité suivante:\n\n🛏  Chambre Double Deluxe — €220/nuit\n⭐  Suite Junior — €310/nuit\n\nLa Chambre Double Deluxe inclut le petit-déjeuner et une vue sur le jardin.\n3 nuits × €220 = **€660** au total.\n\nSouhaitez-vous réserver la Chambre Double Deluxe?",
    aiPaymentMsg: "Parfait Sophie! 🎉 J'ai créé votre réservation et envoyé un lien de paiement sécurisé sur votre WhatsApp.\n\nMontant: €660 · Paiement 100% sécurisé.",
    aiConfirm: "Paiement confirmé ✅ Votre Chambre Double Deluxe est réservée!\n\nUne confirmation a été envoyée sur votre WhatsApp. Nous avons hâte de vous accueillir le 15 août! 🌹",
    room: "Deluxe Double Room", checkIn: "Aug 15", checkOut: "Aug 18", nights: 3, guestCount: 2, pricePerNight: 220, currency: "€",
  },
  {
    name: "Lorenzo Ricci", initials: "LR", avatarColor: "bg-orange-500", phone: "+39 320 765 1234",
    language: "IT", flag: "🇮🇹",
    inquiry: "Buongiorno! Cerco una camera per due persone dal 20 al 25 settembre. Ha disponibilità?",
    aiGreet: "Buongiorno Lorenzo! 🌟 Benvenuto al Grand Hotel Demo. Verifico subito le disponibilità per il 20-25 settembre…",
    aiOffer: "Perfetto! Ho trovato le seguenti opzioni per il vostro soggiorno:\n\n🛏  Camera Doppia Superior — €170/notte\n⭐  Suite con Vista Mare — €280/notte\n\nLa Camera Doppia Superior include colazione e accesso alla piscina.\n5 notti × €170 = **€850** totale.\n\nProcedo con la prenotazione?",
    aiPaymentMsg: "Meraviglioso! 🎉 La prenotazione è pronta. Ho inviato il link di pagamento sicuro al vostro WhatsApp.\n\nImporto: €850 · Pagamento sicuro garantito.",
    aiConfirm: "Pagamento confermato ✅ La Camera Doppia Superior è prenotata!\n\nUna conferma è stata inviata al tuo WhatsApp. Non vediamo l'ora di accoglierti il 20 settembre! 🌊",
    room: "Superior Double Room", checkIn: "Sep 20", checkOut: "Sep 25", nights: 5, guestCount: 2, pricePerNight: 170, currency: "€",
  },
  {
    name: "Anna Hoffmann", initials: "AH", avatarColor: "bg-sky-500", phone: "+49 176 543 2100",
    language: "DE", flag: "🇩🇪",
    inquiry: "Guten Tag! Wir suchen ein Zimmer für 2 Erwachsene und 1 Kind vom 10. bis 14. Juli. Haben Sie etwas Passendes?",
    aiGreet: "Guten Tag Anna! 👋 Herzlich willkommen im Grand Hotel Demo. Ich prüfe sofort die Verfügbarkeit für den 10.–14. Juli…",
    aiOffer: "Tolle Neuigkeiten! Für Ihre Familie habe ich folgende Optionen:\n\n🛏  Familienzimmer (2+1) — €190/Nacht\n⭐  Junior Suite — €260/Nacht\n\nDas Familienzimmer bietet ein Doppelbett + Kinderbett und Frühstück inklusive.\n4 Nächte × €190 = **€760** Gesamt.\n\nSoll ich die Reservierung vorbereiten?",
    aiPaymentMsg: "Wunderbar! 🎉 Ihre Reservierung ist erstellt. Ich habe den sicheren Zahlungslink an Ihr WhatsApp gesendet.\n\nBetrag: €760 · 100% sichere Zahlung.",
    aiConfirm: "Zahlung bestätigt ✅ Ihr Familienzimmer ist gebucht!\n\nEine Bestätigung wurde an Ihr WhatsApp gesendet. Wir freuen uns darauf, Sie und Ihre Familie am 10. Juli willkommen zu heißen! 🌟",
    room: "Family Room", checkIn: "Jul 10", checkOut: "Jul 14", nights: 4, guestCount: 3, pricePerNight: 190, currency: "€",
  },
  {
    name: "David Lim", initials: "DL", avatarColor: "bg-teal-500", phone: "+65 9123 4567",
    language: "EN", flag: "🇸🇬",
    inquiry: "Hi! I'd like to book a deluxe room for 2 nights, August 8-10. What are your rates?",
    aiGreet: "Hi David! 👋 Welcome to Grand Hotel Demo. Let me check availability for August 8–10 right away…",
    aiOffer: "Great news! I have availability for your dates:\n\n🛏  Deluxe Sea View Room — $260/night\n⭐  Premium Suite — $390/night\n\nThe Deluxe Sea View Room includes breakfast, pool access, and a stunning ocean view.\n2 nights × $260 = **$520** total.\n\nShall I reserve the Deluxe Sea View Room for you?",
    aiPaymentMsg: "Excellent choice! 🎉 Your reservation is ready. I've sent a secure payment link to your WhatsApp.\n\nAmount: $520 · Secure checkout.",
    aiConfirm: "Payment confirmed ✅ Your Deluxe Sea View Room is booked!\n\nA confirmation has been sent to your WhatsApp. Looking forward to welcoming you on August 8! 🌴",
    room: "Deluxe Sea View Room", checkIn: "Aug 8", checkOut: "Aug 10", nights: 2, guestCount: 2, pricePerNight: 260, currency: "$",
  },
  {
    name: "Isabel Ferreira", initials: "IF", avatarColor: "bg-fuchsia-500", phone: "+55 11 9 8765 4321",
    language: "PT", flag: "🇧🇷",
    inquiry: "Olá! Gostaria de reservar um quarto duplo para 3 noites a partir de 5 de outubro. Tem disponibilidade?",
    aiGreet: "Olá Isabel! 🌟 Bem-vinda ao Grand Hotel Demo. Verificando disponibilidade para 5-8 de outubro agora…",
    aiOffer: "Ótima notícia! Encontrei as seguintes opções para você:\n\n🛏  Quarto Duplo Standard — €140/noite\n⭐  Quarto Duplo Superior — €195/noite\n\nO Quarto Duplo Superior inclui café da manhã, acesso à piscina e vista para o jardim.\n3 noites × €195 = **€585** total.\n\nDeseja reservar o Quarto Duplo Superior?",
    aiPaymentMsg: "Perfeito! 🎉 Sua reserva está criada. Enviei o link de pagamento seguro para o seu WhatsApp.\n\nValor: €585 · Pagamento 100% seguro.",
    aiConfirm: "Pagamento confirmado ✅ Seu Quarto Duplo Superior está reservado!\n\nUma confirmação foi enviada ao seu WhatsApp. Mal podemos esperar para recebê-la em 5 de outubro! 🌸",
    room: "Superior Double Room", checkIn: "Oct 5", checkOut: "Oct 8", nights: 3, guestCount: 2, pricePerNight: 195, currency: "€",
  },
];

// ─── Toast type ───────────────────────────────────────────────────────────────

type ToastData = { title: string; sub?: string; type: "success" | "new" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("c2");
  const [opsTick, setOpsTick] = useState(0);

  // Demo mode
  const [demoMode, setDemoMode] = useState(false);
  const [demoConversations, setDemoConversations] = useState<Conversation[]>([]);
  const [demoChatThreads, setDemoChatThreads] = useState<Record<string, ChatThread>>({});

  // Per-conversation interactive state
  const [localStatuses, setLocalStatuses] = useState<Record<string, ConversationStatus>>({});
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMsg[]>>({});
  const [localTyping, setLocalTyping] = useState<Record<string, boolean>>({});
  const [localUnreads, setLocalUnreads] = useState<Record<string, number>>(
    Object.fromEntries(CONVERSATIONS.map((c) => [c.id, c.unread]))
  );
  const [localLastMsgs, setLocalLastMsgs] = useState<Record<string, string>>({});
  const [localReservations, setLocalReservations] = useState<Record<string, ConvReservation>>({});
  const [confirmedReservations, setConfirmedReservations] = useState<Record<string, boolean>>({});

  const [sentLink, setSentLink] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef(selected);
  const demoActiveRef = useRef(false);
  const demoTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const demoRoundRef = useRef(0);

  const [opsPhase, setOpsPhase] = useState<OpsPhase>("triage");
  const [opsPulseAt, setOpsPulseAt] = useState<number>(() => Date.now());
  const [lastSyncAt, setLastSyncAt] = useState<number>(() => Date.now());

  // Keep ref in sync for stale-closure safety in timeouts
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // ── Derived values for selected conversation ───────────────────────────────

  // Include demo conversations (newest first) in lookup
  const allConvs: Conversation[] = [...demoConversations, ...CONVERSATIONS];
  const selectedConv = allConvs.find((c) => c.id === selected)!;
  const thread = CHAT_THREADS[selected] ?? demoChatThreads[selected];

  const hasLocalStatus = selected in localStatuses;
  const effectiveStatus: ConversationStatus = localStatuses[selected] ?? selectedConv?.status;
  const allMessages: ChatMsg[] = [...(thread?.messages ?? []), ...(localMessages[selected] ?? [])];
  const isAiTyping = hasLocalStatus
    ? (localTyping[selected] ?? false)
    : (thread?.aiTyping ?? false);

  // Reservation: localReservations (demo / manual) takes priority over thread data
  const rawReservation = localReservations[selected] ?? thread?.reservation;
  const effectiveReservation: ConvReservation | undefined = rawReservation
    ? confirmedReservations[selected]
      ? { ...rawReservation, status: "confirmed" as const }
      : rawReservation
    : undefined;

  const selectedReservationStatus = effectiveReservation?.status;

  // Pre-compute confirmed metrics for MetricsBar (includes demo revenue via localReservations)
  const confirmedCount = Object.values(confirmedReservations).filter(Boolean).length;
  const confirmedRevenue = Object.entries(confirmedReservations)
    .filter(([, v]) => v)
    .reduce((sum, [id]) => {
      const staticTotal = CHAT_THREADS[id]?.reservation?.total;
      const localTotal = localReservations[id]?.total;
      return sum + (staticTotal ?? localTotal ?? 0);
    }, 0);

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

  // Global "live ops" tick (demo-only presence layer; no backend)
  useEffect(() => {
    const t = setInterval(() => {
      setOpsTick((v) => (v + 1) % 1000);
      setLastSyncAt(Date.now());
      // occasional micro-pulse so UI feels alive, but calm
      if (Math.random() < 0.33) setOpsPulseAt(Date.now());
    }, 2600);
    return () => clearInterval(t);
  }, []);

  // Derive an ops phase for the currently selected conversation.
  useEffect(() => {
    // resolved convs should feel "quiet"
    if (effectiveStatus === "resolved") {
      setOpsPhase("idle");
      return;
    }

    if (effectiveStatus === "human_takeover") {
      setOpsPhase("triage");
      return;
    }

    // AI active
    if (selectedReservationStatus === "pending_payment") {
      setOpsPhase("awaiting_payment");
      return;
    }
    if (selectedReservationStatus === "quoted") {
      // oscillate between offer + follow-up scheduled (calm)
      setOpsPhase(opsTick % 2 === 0 ? "generating_offer" : "follow_up_scheduled");
      return;
    }

    // If AI typing we can imply ongoing checks/offer generation
    if (isAiTyping) {
      setOpsPhase(opsTick % 3 === 0 ? "checking_availability" : "generating_offer");
      return;
    }

    setOpsPhase("triage");
  }, [effectiveStatus, isAiTyping, opsTick, selectedReservationStatus]);

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

  // Simulate a follow-up from Elena Petrov (c3, human_takeover) at 22s
  useEffect(() => {
    const incomingId = "c3";
    const timer = setTimeout(() => {
      const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      const msg: ChatMsg = {
        id: "incoming-elena-followup",
        dir: "in",
        body: "Здравствуйте! Я всё ещё жду ответа. Вы можете подтвердить наличие Делюкс-номера?",
        time: now,
      };
      addMessages(incomingId, [msg]);
      setLocalLastMsgs((prev) => ({ ...prev, [incomingId]: "Жду ответа по Делюкс-номеру…" }));
      if (selectedRef.current !== incomingId) {
        setLocalUnreads((prev) => ({ ...prev, [incomingId]: (prev[incomingId] ?? 0) + 1 }));
        showToast("New message · Elena Petrov 🇷🇺", "Still waiting for room confirmation", "new");
      }
    }, 22000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start / stop demo mode when toggle changes
  useEffect(() => {
    demoActiveRef.current = demoMode;
    if (!demoMode) {
      clearDemoTimers();
      return;
    }
    // Small delay so the toggle animation settles, then start first run
    const startTimer = setTimeout(() => {
      if (demoActiveRef.current) runDemoFlow();
    }, 1200);
    return () => {
      demoActiveRef.current = false;
      clearTimeout(startTimer);
      clearDemoTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // ── Demo helpers ───────────────────────────────────────────────────────────

  function clearDemoTimers() {
    demoTimersRef.current.forEach(clearTimeout);
    demoTimersRef.current = [];
  }

  function addDemoTimeout(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    demoTimersRef.current.push(t);
    return t;
  }

  function runDemoFlow() {
    if (!demoActiveRef.current) return;

    const guest = DEMO_GUESTS[demoRoundRef.current % DEMO_GUESTS.length];
    demoRoundRef.current += 1;

    const convId = `demo-${Date.now()}`;
    const ts = () =>
      new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const t0 = ts();

    // ── 1. New inquiry appears in list ──────────────────────────────────────
    const newConv: Conversation = {
      id: convId,
      contact: { name: guest.name, initials: guest.initials, avatarColor: guest.avatarColor, phone: guest.phone },
      lastMessage: guest.inquiry,
      time: "just now",
      language: guest.language,
      status: "ai_active",
      leadStatus: "new",
      unread: 1,
      messageCount: 1,
      channel: "whatsapp",
    };
    setDemoConversations((prev) => [newConv, ...prev]);
    setDemoChatThreads((prev) => ({
      ...prev,
      [convId]: { messages: [{ id: `${convId}-m0`, dir: "in", body: guest.inquiry, time: t0 }] },
    }));
    setLocalUnreads((prev) => ({ ...prev, [convId]: 1 }));
    setLocalLastMsgs((prev) => ({ ...prev, [convId]: guest.inquiry }));
    setSelected(convId);
    showToast(`New inquiry · ${guest.name} ${guest.flag}`, guest.inquiry.slice(0, 52) + "…", "new");

    // ── 2. AI starts typing ─────────────────────────────────────────────────
    addDemoTimeout(() => {
      setLocalUnreads((prev) => ({ ...prev, [convId]: 0 }));
      setLocalTyping((prev) => ({ ...prev, [convId]: true }));
    }, 2200);

    // ── 3. AI greeting ──────────────────────────────────────────────────────
    addDemoTimeout(() => {
      setLocalTyping((prev) => ({ ...prev, [convId]: false }));
      addMessages(convId, [{ id: `${convId}-ai1`, dir: "out", by: "ai", body: guest.aiGreet, time: ts() }]);
    }, 4500);

    // ── 4. AI starts typing for offer ───────────────────────────────────────
    addDemoTimeout(() => {
      setLocalTyping((prev) => ({ ...prev, [convId]: true }));
    }, 6200);

    // ── 5. AI sends room offer ──────────────────────────────────────────────
    addDemoTimeout(() => {
      setLocalTyping((prev) => ({ ...prev, [convId]: false }));
      addMessages(convId, [{ id: `${convId}-ai2`, dir: "out", by: "ai", body: guest.aiOffer, time: ts() }]);
    }, 9500);

    // ── 6. Reservation card — quoted ────────────────────────────────────────
    addDemoTimeout(() => {
      const total = guest.pricePerNight * guest.nights;
      const reservation: ConvReservation = {
        ref: `GH${Math.floor(1000 + Math.random() * 9000)}`,
        guest: guest.name,
        room: guest.room,
        checkIn: guest.checkIn,
        checkOut: guest.checkOut,
        nights: guest.nights,
        guests: guest.guestCount,
        pricePerNight: guest.pricePerNight,
        total,
        currency: guest.currency,
        status: "quoted",
      };
      setLocalReservations((prev) => ({ ...prev, [convId]: reservation }));
      showToast(`Quote created · ${guest.name}`, `${guest.room} · ${guest.currency}${total.toLocaleString()}`, "success");
    }, 12500);

    // ── 7. AI typing for payment link ───────────────────────────────────────
    addDemoTimeout(() => {
      setLocalTyping((prev) => ({ ...prev, [convId]: true }));
    }, 15000);

    // ── 8. Payment link sent ────────────────────────────────────────────────
    addDemoTimeout(() => {
      setLocalTyping((prev) => ({ ...prev, [convId]: false }));
      setLocalReservations((prev) =>
        prev[convId] ? { ...prev, [convId]: { ...prev[convId]!, status: "pending_payment" } } : prev
      );
      addMessages(convId, [{ id: `${convId}-ai3`, dir: "out", by: "ai", body: guest.aiPaymentMsg, time: ts() }]);
      const total = guest.pricePerNight * guest.nights;
      showToast("Payment link sent", `${guest.name} · ${guest.currency}${total.toLocaleString()}`, "success");
    }, 17500);

    // ── 9. Payment confirmed → reservation confirmed + revenue up ───────────
    addDemoTimeout(() => {
      const sysTime = ts();
      const total = guest.pricePerNight * guest.nights;
      setLocalReservations((prev) =>
        prev[convId] ? { ...prev, [convId]: { ...prev[convId]!, status: "confirmed" } } : prev
      );
      setConfirmedReservations((prev) => ({ ...prev, [convId]: true }));
      addMessages(convId, [
        { id: `${convId}-sys`, dir: "system", body: `Payment received · ${guest.currency}${total.toLocaleString()} · ${sysTime}`, time: sysTime },
        { id: `${convId}-ai4`, dir: "out", by: "ai", body: guest.aiConfirm, time: sysTime },
      ]);
      setLocalStatuses((prev) => ({ ...prev, [convId]: "resolved" }));
      showToast("Booking confirmed 🎉", `${guest.name} · ${guest.currency}${total.toLocaleString()} received`, "success");
    }, 22000);

    // ── Schedule next run (28–38 s from now) ───────────────────────────────
    addDemoTimeout(() => {
      if (demoActiveRef.current) runDemoFlow();
    }, 28000 + Math.floor(Math.random() * 10000));
  }

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

  const filtered = allConvs.filter((c) => {
    // Use localStatuses override so demo flow status changes are reflected in tabs
    const effectiveConvStatus = localStatuses[c.id] ?? c.status;
    const matchTab = activeTab === "all" || effectiveConvStatus === activeTab;
    const matchSearch =
      !search ||
      c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Toast */}
      <Toast toast={toast} />

      {/* ── Demo Mode toggle bar ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-white/[0.03] bg-zinc-950/90">
        <div className="flex items-center gap-2 text-[11px] text-white/20">
          <span>Grand Hotel Demo</span>
          <span className="text-white/10">·</span>
          <span>Operations preview</span>
          {demoMode && (
            <span className="flex items-center gap-1 text-blue-400/60 ml-1">
              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
              Auto-demo running
            </span>
          )}
        </div>
        <button
          onClick={() => setDemoMode((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all active:scale-[0.97]",
            demoMode
              ? "bg-blue-500/15 border-blue-500/25 text-blue-300 hover:bg-blue-500/20"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              demoMode ? "bg-blue-400 animate-pulse" : "bg-white/20"
            )}
          />
          Demo Mode {demoMode ? "ON" : "OFF"}
        </button>
      </div>

      {/* ── ROI metrics bar ──────────────────────────────────────────────── */}
      <MetricsBar
        confirmedCount={confirmedCount}
        confirmedRevenue={confirmedRevenue}
        opsPulseAt={opsPulseAt}
        lastSyncAt={lastSyncAt}
      />

      {/* ── Main 3-column area ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

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
        localStatuses={localStatuses}
        localTyping={localTyping}
      />

      {/* ── Center: chat ─────────────────────────────────────────────────── */}
      {selectedConv && thread ? (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden border-r border-white/[0.03] bg-zinc-950/15">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-5 border-b border-white/[0.03] bg-zinc-950/40 backdrop-blur-[6px]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white ring-1 ring-white/[0.06]",
                    selectedConv.contact.avatarColor
                  )}
                >
                  {selectedConv.contact.initials}
                </div>
                <span
                  className="pointer-events-none absolute bottom-0 left-0 z-[1] flex h-[15px] w-[15px] translate-x-[-2px] translate-y-[3px] items-center justify-center rounded-md border border-white/[0.1] bg-zinc-950/95 shadow-sm"
                  title={channelLabel(selectedConv.channel)}
                >
                  <ChannelGlyph channel={selectedConv.channel} className="h-2 w-2" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-semibold tracking-tight text-white">
                    {selectedConv.contact.name}
                  </span>
                  <LanguageFlag lang={selectedConv.language} />
                  <StatusBadge status={effectiveStatus} />
                  <LeadBadge status={selectedConv.leadStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-white/38">
                    <Phone className="h-3 w-3 shrink-0 opacity-70" />
                    {selectedConv.contact.phone}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-white/38">
                    <Clock className="h-3 w-3 shrink-0 opacity-70" />
                    {allMessages.filter((m) => m.dir !== "system").length} messages
                  </span>
                  <span className="hidden items-center gap-1.5 text-[11px] text-white/32 sm:flex">
                    <ChannelGlyph channel={selectedConv.channel} className="h-3 w-3 opacity-80" />
                    {channelLabel(selectedConv.channel)}
                  </span>
                  <OpsLiveChip phase={opsPhase} pulseKey={opsPulseAt} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {effectiveReservation && (
                <Link
                  href="/dashboard/reservations"
                  className="hidden items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[11px] font-medium text-white/48 transition-[background-color,color,border-color] duration-200 hover:border-white/[0.1] hover:bg-white/[0.055] hover:text-white/78 lg:flex"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View booking
                </Link>
              )}
              {effectiveStatus === "ai_active" && (
                <button
                  onClick={handleTakeover}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/18 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-400 transition-[background-color,border-color,transform] duration-200 hover:border-amber-500/26 hover:bg-amber-500/[0.14] active:scale-[0.97]"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Take over
                </button>
              )}
              {effectiveStatus === "human_takeover" && (
                <button
                  onClick={handleHandToAI}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-500/18 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-400 transition-[background-color,border-color,transform] duration-200 hover:border-blue-500/26 hover:bg-blue-500/[0.14] active:scale-[0.97]"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Hand to AI
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="conv-scroll flex-1 min-h-0 space-y-0 overflow-y-auto px-5 py-7 sm:px-6"
          >
            <div className="mx-auto w-full max-w-[min(100%,30.5rem)]">
              <div className="mb-7 flex justify-center">
                <span className="rounded-full border border-white/[0.045] bg-white/[0.025] px-4 py-1.5 text-[11px] font-medium text-white/32">
                  {selectedConv.time.includes("d ago") ? "Yesterday" : "Today"}
                </span>
              </div>
              {allMessages.map((msg, i) => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  conv={selectedConv}
                  prevMsg={i > 0 ? allMessages[i - 1] : undefined}
                />
              ))}
              {effectiveReservation && (
                <div className="pt-6">
                  <ReservationCard
                    reservation={effectiveReservation}
                    convStatus={effectiveStatus}
                    sentLink={sentLink}
                    onSendPaymentLink={handleSendPaymentLink}
                  />
                </div>
              )}
              {isAiTyping && <ChatTypingIndicator />}
              <div className="h-5" />
            </div>
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
      </div>{/* end 3-column area */}
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

// ─── useCountUp ───────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1100): number {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef<number | null>(null);
  const runRef = useRef<{ from: number; to: number; startMs: number } | null>(null);

  useEffect(() => {
    const from = runRef.current?.to ?? 0;
    runRef.current = { from, to: target, startMs: performance.now() };

    function tick(now: number) {
      if (!runRef.current) return;
      const { from, to, startMs } = runRef.current;
      const t = Math.min((now - startMs) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return displayed;
}

function timeAgoCompact(nowMs: number, thenMs: number): string {
  const s = Math.max(0, Math.floor((nowMs - thenMs) / 1000));
  if (s < 3) return "now";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}

// ─── MetricsBar ───────────────────────────────────────────────────────────────

function MetricsBar({
  confirmedCount,
  confirmedRevenue,
  opsPulseAt,
  lastSyncAt,
}: {
  confirmedCount: number;
  confirmedRevenue: number;
  opsPulseAt: number;
  lastSyncAt: number;
}) {
  const bookings = BASE_METRICS.bookings + confirmedCount;
  const revenue = BASE_METRICS.revenue + confirmedRevenue;
  const otaSaved = Math.round(revenue * 0.15);

  // Animate numbers smoothly on mount and when values change (e.g. after payment confirmation)
  const displayBookings = useCountUp(bookings);
  const displayRevenue = useCountUp(revenue);
  const displayOta = useCountUp(otaSaved);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1200);
    return () => clearInterval(t);
  }, []);

  const values: Record<typeof METRIC_DEFS[number]["key"], { display: string; sub: string; trend: string }> = {
    bookings: {
      display: String(displayBookings),
      sub: `€${(2480 + confirmedRevenue).toLocaleString()} revenue`,
      trend: `+${confirmedCount > 0 ? confirmedCount + 2 : 2} vs yesterday`,
    },
    revenue: {
      display: `€${displayRevenue.toLocaleString()}`,
      sub: "direct bookings · this week",
      trend: `+€${(890 + confirmedRevenue).toLocaleString()} vs last week`,
    },
    ota: {
      display: `€${displayOta.toLocaleString()}`,
      sub: "15% rate on direct only",
      trend: `+€${Math.round((133 + confirmedRevenue * 0.15)).toLocaleString()} this week`,
    },
    response: {
      display: BASE_METRICS.responseTime,
      sub: "vs. 4h industry average",
      trend: "↓ 12s faster than last wk",
    },
    leads: {
      display: String(BASE_METRICS.leadsAfterHours),
      sub: "would've gone unanswered",
      trend: "100% captured",
    },
  };

  return (
    <div className="shrink-0 border-b border-white/[0.03] bg-zinc-950/55">
      <div className="flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/24">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400/70 animate-live-pulse" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
            </span>
            Live ops
          </span>
          <span className="text-white/10">·</span>
          <span className={cn("text-white/22", opsPulseAt ? "animate-tick-fade" : "")}>
            sync {timeAgoCompact(nowMs, lastSyncAt)} ago
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/18">
          <span className="hidden sm:inline">Ops signals are simulated</span>
          <span className="h-3 w-px bg-white/10" />
          <span className="font-medium text-white/22">demo</span>
        </div>
      </div>

      <div className="grid grid-cols-5 border-t border-white/[0.03]">
      {METRIC_DEFS.map((m, i) => {
        const v = values[m.key];
        return (
          <div
            key={m.key}
            className={cn(
              "flex items-center gap-3.5 px-5 py-5",
              i < METRIC_DEFS.length - 1 && "border-r border-white/[0.03]"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                m.iconBg
              )}
            >
              <m.icon className={cn("w-3.5 h-3.5", m.color)} />
            </div>

            {/* Value + labels */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[17px] font-bold tabular-nums leading-none transition-all duration-700",
                    m.color
                  )}
                >
                  {v.display}
                </span>
                {/* Revenue metric gets a larger, more prominent week comparison */}
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-medium leading-none",
                    m.key === "revenue"
                      ? "text-[11px] text-emerald-400/75"
                      : "text-[10px] text-emerald-400/50"
                  )}
                >
                  <ArrowUpRight className={cn("shrink-0", m.key === "revenue" ? "w-3 h-3" : "w-2.5 h-2.5")} />
                  {v.trend}
                </span>
              </div>
              <p className="text-[10px] text-white/42 mt-1.5 truncate font-medium">{m.label}</p>
              <p className="text-[9px] text-white/24 mt-0.5 truncate">{v.sub}</p>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function OpsLiveChip({ phase, pulseKey }: { phase: OpsPhase; pulseKey: number }) {
  const meta = useMemo(() => {
    if (phase === "idle") return null;
    return OPS_PHASES.find((p) => p.phase === phase) ?? OPS_PHASES[0];
  }, [phase]);

  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <span
      key={`${phase}-${pulseKey}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        meta.wrap,
        meta.text,
        "animate-tick-fade"
      )}
      title={meta.sub}
    >
      <Icon className={cn("h-3 w-3 shrink-0", phase === "checking_availability" ? "animate-spin [animation-duration:2.6s]" : "")} />
      <span className="hidden sm:inline">{meta.label}</span>
      <span className="text-white/18 hidden sm:inline">·</span>
      <span className="hidden sm:inline text-white/40">{meta.sub}</span>
      <span className="sm:hidden">AI</span>
    </span>
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
  localStatuses,
  localTyping,
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
  localStatuses: Record<string, ConversationStatus>;
  localTyping: Record<string, boolean>;
}) {
  return (
    <div className="flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-white/[0.03] bg-zinc-950/35">
      {/* Header */}
      <div className="border-b border-white/[0.03] px-4 pb-5 pt-6">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-white">Guest threads</h1>
            <p className="mt-1 text-[11px] leading-relaxed text-white/30">
              Grand Hotel Demo
              <span className="mx-1.5 text-white/12">·</span>
              <span className="text-blue-400/75">Ops layer active</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-2.5 py-1 transition-colors duration-200 hover:border-blue-500/30 hover:bg-blue-500/[0.11]">
              <Bot className="h-2.5 w-2.5 text-blue-400" />
              <span className="text-[10px] font-semibold text-blue-400/95">4 closing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400/90" />
              <span className="text-[9px] font-medium uppercase tracking-wide text-white/22">Live</span>
            </div>
          </div>
        </div>

        {/* KPI stats */}
        <div className="mb-4 mt-5 grid grid-cols-3 gap-2.5">
          {[
            { label: "Ops active", value: "4", color: "text-blue-400", bg: "bg-blue-500/[0.06] border-blue-500/[0.1]" },
            { label: "Pipeline", value: "€3.4k", color: "text-amber-400", bg: "bg-amber-500/[0.06] border-amber-500/[0.1]" },
            { label: "Confirmed", value: "3", color: "text-emerald-400", bg: "bg-emerald-500/[0.06] border-emerald-500/[0.1]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-lg border px-2.5 py-3 text-center transition-colors duration-200 hover:bg-white/[0.02]",
                stat.bg
              )}
            >
              <p className={cn("text-[16px] font-bold tabular-nums leading-none", stat.color)}>{stat.value}</p>
              <p className="mt-2 text-[9px] font-medium uppercase tracking-wider text-white/28">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* OTA dependency risk insight */}
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-amber-500/[0.08] bg-amber-500/[0.04] px-3 py-3">
          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400/55" />
          <p className="min-w-0 flex-1 text-[10px] leading-relaxed text-white/38">
            OTA route costs you{" "}
            <span className="font-semibold text-amber-400/75">15–20%</span> per booking
            <span className="mx-1 text-white/12">·</span>
            <span className="font-medium text-emerald-400/65">€634 saved this week</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/22" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests or messages…"
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.035] py-2 pl-9 pr-3 text-[12px] text-white placeholder:text-white/22 transition-[border-color,background-color,box-shadow] duration-200 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-blue-500/25 focus:border-blue-500/35"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-white/[0.03] px-3 py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md py-2.5 text-[11px] font-medium transition-colors duration-200 ease-out",
              activeTab === t.id
                ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                : "text-white/32 hover:bg-white/[0.04] hover:text-white/55"
            )}
          >
            {t.id === "ai_active" && (
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-blue-400/90" />
            )}
            {t.id === "human_takeover" && t.count > 0 && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/90" />
            )}
            <span className="truncate">{t.label}</span>
            <span
              className={cn(
                "min-w-[18px] shrink-0 rounded-full px-1.5 py-0.5 text-center text-[10px] tabular-nums transition-colors duration-200",
                activeTab === t.id ? "bg-white/[0.08] text-white/55" : "bg-white/[0.04] text-white/22"
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="conv-scroll flex flex-1 min-h-0 flex-col gap-1.5 overflow-y-auto px-2.5 py-3">
        {/* Waiting guests triage — only visible when staff attention is needed */}
        {(() => {
          const waiting = filtered.filter(
            (c) => c.status === "human_takeover" && (localUnreads[c.id] ?? c.unread) > 0
          );
          if (waiting.length === 0) return null;
          return (
            <div className="mx-2 mb-3 mt-1 rounded-lg border border-amber-500/[0.12] bg-amber-500/[0.04] px-3 py-3">
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-400/85" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-400/75">
                  {waiting.length} guest{waiting.length !== 1 ? "s" : ""} waiting for staff
                </span>
              </div>
              {waiting.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className="mt-1 flex w-full items-center gap-2 rounded-md py-1 text-left text-[10px] text-white/55 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white/75"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", c.contact.avatarColor)} />
                  <span className="truncate font-medium">{c.contact.name}</span>
                  <span className="shrink-0 text-white/12">·</span>
                  <span className="shrink-0 font-medium text-amber-400/70">{c.time}</span>
                </button>
              ))}
            </div>
          );
        })()}

        {filtered.map((conv) => {
          const revenue = CONV_REVENUE[conv.id];
          const isSelected = selected === conv.id;
          const unread = localUnreads[conv.id] ?? conv.unread;
          const lastMsg = localLastMsgs[conv.id] ?? conv.lastMessage;
          const hasUnread = unread > 0;
          const effectiveConvStatus = localStatuses[conv.id] ?? conv.status;
          const isAiHandling = effectiveConvStatus === "ai_active";
          const isAiWorking = isAiHandling && (localTyping[conv.id] ?? CHAT_THREADS[conv.id]?.aiTyping ?? false);
          // Show waiting indicator only for human_takeover with unread messages
          const isWaiting = effectiveConvStatus === "human_takeover" && hasUnread && !isSelected;

          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => setSelected(conv.id)}
              className={cn(
                "group w-full rounded-lg border-l-2 py-3.5 pl-3.5 pr-3.5 text-left transition-[background-color,border-color,box-shadow] duration-200 ease-out",
                isSelected
                  ? "border-amber-400/60 bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
                  : isWaiting
                  ? "border-amber-400/20 bg-amber-500/[0.025] hover:border-amber-400/35 hover:bg-amber-500/[0.045]"
                  : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.035]",
                !isSelected && hasUnread && !isWaiting && "bg-blue-500/[0.02] hover:bg-blue-500/[0.035]"
              )}
            >
              <div className="flex gap-3">
                <div className="relative shrink-0 pt-0.5">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-white ring-1 ring-black/25 ring-inset",
                      conv.contact.avatarColor
                    )}
                  >
                    {conv.contact.initials}
                  </div>
                  <span
                    className="pointer-events-none absolute bottom-0 left-0 z-[2] flex h-[15px] w-[15px] translate-x-[-2px] translate-y-[3px] items-center justify-center rounded-md border border-white/[0.1] bg-zinc-950/95 shadow-sm backdrop-blur-[2px] transition-transform duration-200 group-hover:translate-y-[2px]"
                    title={channelLabel(conv.channel)}
                  >
                    <ChannelGlyph channel={conv.channel} className="h-2 w-2" />
                  </span>
                  {effectiveConvStatus === "ai_active" && (
                    <span className="absolute -bottom-0.5 -right-0.5 z-[1] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-zinc-950 bg-blue-600 shadow-sm">
                      <Bot className="h-1.5 w-1.5 text-white" />
                    </span>
                  )}
                  {effectiveConvStatus === "human_takeover" && (
                    <span className="absolute -bottom-0.5 -right-0.5 z-[1] h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-amber-500 shadow-sm" />
                  )}
                  {effectiveConvStatus === "resolved" && (
                    <span className="absolute -bottom-0.5 -right-0.5 z-[1] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-700 shadow-sm">
                      <CheckCircle2 className="h-2 w-2 text-white/65" />
                    </span>
                  )}
                  {hasUnread && (
                    <span
                      className={cn(
                        "absolute -right-0.5 -top-0.5 z-[3] flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-white shadow-[0_1px_2px_rgba(0,0,0,0.4)] ring-1 ring-black/35 transition-transform duration-200 group-hover:scale-[1.02]",
                        isWaiting ? "bg-amber-500 animate-ring-amber" : "bg-blue-500/95"
                      )}
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={cn(
                          "truncate text-sm font-medium tracking-tight transition-colors duration-200",
                          hasUnread ? "text-white" : "text-white/78 group-hover:text-white/88"
                        )}
                      >
                        {conv.contact.name}
                      </span>
                      <LanguageFlag lang={conv.language} />
                      {isAiWorking && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/18 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-200/80 animate-tick-fade">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400/90 animate-live-pulse" />
                          working
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 pt-0.5 text-[10px] font-medium tabular-nums tracking-tight transition-colors duration-200",
                        isWaiting
                          ? "text-amber-400/75"
                          : isSelected
                          ? "text-white/34"
                          : "text-white/22 group-hover:text-white/34"
                      )}
                    >
                      {isWaiting ? `Waiting · ${conv.time.replace(" ago", "")}` : conv.time}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mb-3 line-clamp-2 text-[11px] leading-relaxed transition-colors duration-200",
                      hasUnread ? "text-white/46" : isSelected ? "text-white/34" : "text-white/26 group-hover:text-white/34"
                    )}
                  >
                    {lastMsg}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5", !isSelected && "opacity-[0.85]")}>
                      <StatusBadge status={effectiveConvStatus} />
                      <LeadBadge status={conv.leadStatus} />
                    </div>
                    {revenue && (
                      <span
                        className={cn(
                          "shrink-0 text-[11px] font-semibold tabular-nums transition-colors duration-200",
                          revenue.status === "confirmed"
                            ? "text-emerald-400/80"
                            : revenue.status === "pending"
                            ? "text-amber-400/80"
                            : "text-blue-400/80"
                          ,
                          !isSelected && "opacity-[0.72] group-hover:opacity-[0.9]"
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
          <p className="py-14 text-center text-sm text-white/22">No conversations found</p>
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
    <div className="conv-scroll flex w-[284px] shrink-0 flex-col overflow-y-auto bg-zinc-950/40">
      {/* Guest profile */}
      <div className="border-b border-white/[0.03] px-5 py-6">
        <SidebarLabel>Guest</SidebarLabel>
        <div className="mb-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-white/[0.06]",
                conv.contact.avatarColor
              )}
            >
              {conv.contact.initials}
            </div>
            <span
              className="pointer-events-none absolute bottom-0 left-0 z-[1] flex h-[15px] w-[15px] translate-x-[-2px] translate-y-[3px] items-center justify-center rounded-md border border-white/[0.1] bg-zinc-950/95 shadow-sm"
              title={channelLabel(conv.channel)}
            >
              <ChannelGlyph channel={conv.channel} className="h-2 w-2" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight tracking-tight text-white">
              {conv.contact.name}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <LanguageFlag lang={conv.language} />
              <span className="text-[11px] text-white/34">{conv.language} speaker</span>
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-[11px] text-white/36">
            <Phone className="h-3 w-3 shrink-0 opacity-80" />
            <span className="font-mono">{conv.contact.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-white/34">
            <Clock className="h-3 w-3 shrink-0 opacity-80" />
            <span>
              {conv.messageCount} messages · {conv.time}
            </span>
          </div>
        </div>
      </div>

      {/* Booking summary */}
      {r && (
        <div className="border-b border-white/[0.03] px-5 py-6">
          <SidebarLabel>Booking</SidebarLabel>
          <div
            className={cn(
              "rounded-xl border p-5 transition-all duration-500",
              r.status === "confirmed"
                ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                : r.status === "pending_payment"
                ? "border-amber-500/24 bg-amber-500/[0.05]"
                : "border-blue-500/20 bg-blue-500/[0.04]"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-white/38">#{r.ref}</span>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-500",
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
            <p className="text-[12px] font-semibold text-white/88 mb-4 leading-snug">{r.room}</p>
            <div className="space-y-2 text-[11px]">
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
            <div className="mt-5 border-t border-white/[0.045] pt-4 flex items-baseline justify-between">
              <span className="text-[10px] font-medium text-white/32">Total</span>
              <span className="text-[20px] font-bold text-white tabular-nums tracking-tight">
                {r.currency}{r.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="border-b border-white/[0.03] px-5 py-6">
        <SidebarLabel>Quick Actions</SidebarLabel>
        <div className="flex flex-col gap-3">
          {showPaymentBtn && (
            <button
              type="button"
              onClick={onSendPaymentLink}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-semibold transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.98]",
                sentLink
                  ? "border-emerald-500/22 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/22 bg-amber-500/14 text-amber-200 hover:border-amber-500/30 hover:bg-amber-500/[0.18]"
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
              type="button"
              onClick={onTakeover}
              className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-2.5 text-[12px] font-medium text-white/42 transition-[background-color,color,border-color,transform] duration-200 hover:border-white/[0.09] hover:bg-white/[0.045] hover:text-white/65 active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              Take over chat
            </button>
          )}
          {effectiveStatus === "human_takeover" && (
            <button
              type="button"
              onClick={onHandToAI}
              className="flex w-full items-center gap-2.5 rounded-xl border border-blue-500/18 bg-blue-500/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-blue-300/90 transition-[background-color,border-color,transform] duration-200 hover:border-blue-500/26 hover:bg-blue-500/[0.12] active:scale-[0.98]"
            >
              <Bot className="w-4 h-4 shrink-0" />
              Hand back to AI
            </button>
          )}
          {r && (
            <Link
              href="/dashboard/reservations"
              className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.05] bg-transparent px-3.5 py-2.5 text-[12px] font-medium text-white/34 transition-[background-color,color,border-color,transform] duration-200 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-white/55 active:scale-[0.98]"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              View full reservation
            </Link>
          )}
        </div>
      </div>

      {/* AI Context */}
      <div className="px-5 py-6 pb-8">
        <SidebarLabel>AI Context</SidebarLabel>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="shrink-0 text-white/26">Lead stage</span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full font-semibold shrink-0",
                conv.leadStatus === "confirmed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : conv.leadStatus === "quoted"
                  ? "bg-blue-500/15 text-blue-400"
                  : conv.leadStatus === "qualified"
                  ? "bg-violet-500/15 text-violet-400"
                  : "bg-white/[0.05] text-white/34"
              )}
            >
              {conv.leadStatus.charAt(0).toUpperCase() + conv.leadStatus.slice(1)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="shrink-0 text-white/26">Handler</span>
            <span
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-all shrink-0",
                effectiveStatus === "ai_active"
                  ? "bg-blue-500/15 text-blue-400"
                  : effectiveStatus === "human_takeover"
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-white/[0.05] text-white/34"
              )}
            >
              {effectiveStatus === "ai_active" ? (
                <><Bot className="w-3 h-3" />Tugobo ops</>
              ) : effectiveStatus === "human_takeover" ? (
                <><User className="w-3 h-3" />Staff</>
              ) : (
                <><CheckCircle2 className="w-3 h-3" />Resolved</>
              )}
            </span>
          </div>
          {effectiveStatus === "ai_active" && (
            <div>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="text-white/26">AI confidence</span>
                <span className="text-white/56 font-semibold tabular-nums">87%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all opacity-[0.9]"
                  style={{ width: "87%" }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-white/24">
            <TrendingUp className="h-3 w-3 shrink-0 opacity-80" />
            <span>
              Via {channelLabel(conv.channel)} · {conv.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SidebarLabel ─────────────────────────────────────────────────────────────

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/26">
      {children}
    </p>
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
      border: "border-emerald-500/25",
      header: "bg-emerald-500/[0.08]",
      iconColor: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      dot: "bg-emerald-400",
    },
    pending_payment: {
      label: "Pending Payment",
      icon: AlertCircle,
      border: "border-amber-500/25",
      header: "bg-amber-500/[0.07]",
      iconColor: "text-amber-400",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      dot: "bg-amber-400 animate-pulse",
    },
    quoted: {
      label: "Quote Sent",
      icon: FileText,
      border: "border-blue-500/25",
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
        "overflow-hidden rounded-2xl border bg-zinc-900/75 shadow-lg shadow-black/20 transition-[border-color,box-shadow] duration-500",
        s.border
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between px-5 py-4 transition-all duration-500", s.header)}>
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
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-500",
            s.badge
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
          {s.label}
        </span>
      </div>

      {/* Details */}
      <div className="px-5 pt-5 pb-1">
        <p className="text-[13px] font-semibold text-white/90 mb-3.5">{r.room}</p>
        <div className="mb-4 grid grid-cols-4 gap-3">
          <DetailCell icon={CalendarDays} label="Check-in" value={r.checkIn} iconColor="text-blue-400" />
          <DetailCell icon={CalendarDays} label="Check-out" value={r.checkOut} iconColor="text-blue-400" />
          <DetailCell icon={Users} label="Guests" value={String(r.guests)} iconColor="text-violet-400" />
          <DetailCell icon={Moon} label="Nights" value={String(r.nights)} iconColor="text-indigo-400" />
        </div>
        <div className="mb-4 flex items-center justify-between border-t border-white/[0.04] py-4">
          <div>
            <p className="text-[11px] text-white/35 mb-0.5">Price per night</p>
            <p className="text-[13px] text-white/60">
              {r.currency}{r.pricePerNight.toLocaleString()} × {r.nights} nights
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/35 mb-0.5">Total amount</p>
            <p className="text-[22px] font-bold text-white tabular-nums tracking-tight">
              {r.currency}{r.total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pb-5 pt-1">
        <Link
          href="/dashboard/reservations"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.035] border border-white/[0.07] text-white/55 hover:text-white/75 hover:bg-white/[0.055] active:scale-[0.97] text-xs font-medium transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View reservation
        </Link>
        {showPaymentBtn && (
          <button
            onClick={onSendPaymentLink}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]",
              sentLink
                ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-300"
                : r.status === "pending_payment"
                ? "bg-amber-500/16 border border-amber-500/26 text-amber-200 hover:bg-amber-500/20"
                : "bg-blue-500/15 border border-blue-500/24 text-blue-200 hover:bg-blue-500/19"
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
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-transparent border border-white/[0.06] text-white/34 hover:text-white/55 hover:bg-white/[0.04] text-xs font-medium transition-colors ml-auto">
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
    <div className="rounded-xl border border-white/[0.035] bg-white/[0.02] p-3.5">
      <Icon className={cn("w-3.5 h-3.5 mb-2", iconColor)} />
      <p className="text-[10px] text-white/34 mb-1 font-medium">{label}</p>
      <p className="text-[13px] font-semibold text-white/88">{value}</p>
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
      <div className="shrink-0 border-t border-white/[0.03] px-6 py-5">
        <div className="flex items-center justify-center gap-2 py-2">
          <CheckCircle2 className="w-4 h-4 text-white/20" />
          <p className="text-sm text-white/25">Conversation resolved</p>
        </div>
      </div>
    );
  }

  if (status === "ai_active") {
    return (
      <div className="shrink-0 border-t border-white/[0.03] px-6 py-5">
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/14 bg-blue-500/[0.05] px-4 py-3.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-[13px] text-blue-300/60 flex-1">
            The Tugobo operations layer is handling this thread. Click{" "}
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
    <div className="shrink-0 border-t border-white/[0.03] px-6 py-5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          placeholder="Type a reply…"
          className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.045] px-4 py-2.5 text-sm text-white placeholder:text-white/22 transition-[border-color,background-color] duration-200 focus:border-indigo-500/35 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
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
