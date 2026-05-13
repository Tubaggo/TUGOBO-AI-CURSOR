"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import {
  X,
  CheckCircle2,
  Zap,
  User,
  Building2,
  Phone,
  MapPin,
  BarChart3,
  Radio,
  StickyNote,
} from "lucide-react";

// ── Public types (Supabase / CRM / e-posta / WhatsApp entegrasyonu için) ─────

/** Sunucuya gönderilecek demo talebi yükü — alan adları İngilizce, CRM uyumlu */
export type DemoRequestLeadPayload = {
  fullName: string;
  propertyName: string;
  phoneWhatsApp: string;
  city: string;
  avgMonthlyRooms: string | null;
  primaryMessageChannel: DemoPrimaryChannel | null;
  notes: string | null;
  submittedAtIso: string;
};

export type DemoPrimaryChannel = "whatsapp" | "instagram" | "website" | "all";

type DemoPrimaryChannelForm = DemoPrimaryChannel | "";

type DemoFormState = {
  fullName: string;
  propertyName: string;
  phoneWhatsApp: string;
  city: string;
  avgMonthlyRooms: string;
  primaryMessageChannel: DemoPrimaryChannelForm;
  notes: string;
};

const DEMO_HASH = "#tugobo-demo-talep";

const initialForm: DemoFormState = {
  fullName: "",
  propertyName: "",
  phoneWhatsApp: "",
  city: "",
  avgMonthlyRooms: "",
  primaryMessageChannel: "",
  notes: "",
};

const channelLabels: Record<DemoPrimaryChannel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  website: "Web sitesi",
  all: "Hepsi",
};

const formSchema = z.object({
  fullName: z.string().trim().min(1, "Ad soyad gereklidir"),
  propertyName: z.string().trim().min(1, "Otel veya işletme adı gereklidir"),
  phoneWhatsApp: z
    .string()
    .trim()
    .min(1, "Telefon veya WhatsApp gereklidir")
    .refine((s) => s.replace(/\s/g, "").length >= 10, {
      message: "En az 10 karakter girin",
    }),
  city: z.string().trim().min(1, "Şehir gereklidir"),
  avgMonthlyRooms: z.string(),
  primaryMessageChannel: z.union([
    z.literal(""),
    z.literal("whatsapp"),
    z.literal("instagram"),
    z.literal("website"),
    z.literal("all"),
  ]),
  notes: z.string(),
});

function toLeadPayload(values: z.infer<typeof formSchema>): DemoRequestLeadPayload {
  return {
    fullName: values.fullName.trim(),
    propertyName: values.propertyName.trim(),
    phoneWhatsApp: values.phoneWhatsApp.trim(),
    city: values.city.trim(),
    avgMonthlyRooms: values.avgMonthlyRooms.trim() || null,
    primaryMessageChannel:
      values.primaryMessageChannel === ""
        ? null
        : (values.primaryMessageChannel as DemoPrimaryChannel),
    notes: values.notes.trim() || null,
    submittedAtIso: new Date().toISOString(),
  };
}

function mapZodErrors(issue: z.ZodIssue[]): Partial<Record<keyof DemoFormState, string>> {
  const out: Partial<Record<keyof DemoFormState, string>> = {};
  for (const i of issue) {
    const key = i.path[0];
    if (typeof key === "string" && key in initialForm && !out[key as keyof DemoFormState]) {
      out[key as keyof DemoFormState] = i.message;
    }
  }
  return out;
}

// ── Context ───────────────────────────────────────────────────────────────────

type DemoModalContextValue = {
  openModal: () => void;
};

const DemoModalContext = createContext<DemoModalContextValue | null>(null);

/** Web chat ve diğer istemciler için güvenli açıcı (provider yoksa ana sayfa demo anchor’una gider). */
export function useOpenDemoModal(): () => void {
  const ctx = useContext(DemoModalContext);
  return useCallback(() => {
    if (ctx) ctx.openModal();
    else if (typeof window !== "undefined") {
      window.location.assign("/" + DEMO_HASH);
    }
  }, [ctx]);
}

export function DemoModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === DEMO_HASH) {
        setOpen(true);
        const { pathname, search } = window.location;
        window.history.replaceState(null, "", `${pathname}${search}`);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <DemoModalContext.Provider value={{ openModal }}>
      {children}
      {mounted &&
        open &&
        createPortal(<DemoRequestModal onClose={closeModal} />, document.body)}
    </DemoModalContext.Provider>
  );
}

// ── DemoButton ───────────────────────────────────────────────────────────────

export function DemoButton({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ctx = useContext(DemoModalContext);
  if (!ctx) {
    throw new Error("DemoButton must be used within DemoModalProvider");
  }
  return (
    <button type="button" id={id} onClick={() => ctx.openModal()} className={className}>
      {children}
    </button>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-xl text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/35 focus:border-blue-500/50 focus:bg-white/[0.08] transition-all";

const inputErrorCls = "border-rose-500/45 focus:border-rose-500/55 focus:ring-rose-500/20";

// ── DemoRequestModal ───────────────────────────────────────────────────────────

function DemoRequestModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const descId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState<DemoFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DemoFormState, string>>>(
    {}
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKey]);

  useEffect(() => {
    if (step !== "form") return;
    const t = window.requestAnimationFrame(() => {
      firstFieldRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(t);
  }, [step]);

  function setField<K extends keyof DemoFormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const v = e.target.value as DemoFormState[K];
      setForm((f) => ({ ...f, [key]: v }));
      setFieldErrors((err) => {
        if (!err[key]) return err;
        const next = { ...err };
        delete next[key];
        return next;
      });
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(mapZodErrors(parsed.error.issues));
      return;
    }
    setFieldErrors({});
    const _leadPayload: DemoRequestLeadPayload = toLeadPayload(parsed.data);
    void _leadPayload;
    setStep("success");
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-[10px] animate-demo-backdrop-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full sm:max-w-[500px] max-h-[92dvh] sm:max-h-[min(90vh,820px)] bg-zinc-900 border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/70 flex flex-col animate-demo-panel-in mt-auto sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-lg text-white/35 hover:text-white/80 hover:bg-white/[0.08] transition-all z-10 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {step === "success" ? (
          <div className="px-7 py-10 sm:py-12 text-center overflow-y-auto overscroll-contain">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/12 border border-emerald-500/25">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" strokeWidth={1.75} />
            </div>
            <h3 id={titleId} className="text-[22px] font-bold text-white tracking-tight mb-3">
              Demo talebiniz alındı
            </h3>
            <p id={descId} className="text-[14px] text-white/50 leading-relaxed mb-8 max-w-sm mx-auto">
              Teşekkürler. Ekibimiz kısa süre içinde sizinle WhatsApp üzerinden iletişime geçecek.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-xs mx-auto py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[14px] font-semibold text-white/85 hover:bg-white/[0.10] hover:border-white/[0.18] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/35"
            >
              Kapat
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 sm:px-7 pt-6 pb-4 shrink-0 border-b border-white/[0.06]">
              <h2
                id={titleId}
                className="text-[21px] sm:text-[22px] font-bold text-white leading-snug pr-10"
              >
                Ücretsiz demo talep edin
              </h2>
              <p id={descId} className="text-[13px] text-white/42 leading-relaxed mt-2">
                Otelinize özel AI rezervasyon akışını 30 dakikalık kısa bir görüşmede birlikte
                inceleyelim.
              </p>
              <p className="text-[11px] text-white/32 mt-3 leading-relaxed">
                Taahhüt yok · Satış baskısı yok · Otelinize özel değerlendirme
              </p>
            </div>

            <div className="px-6 sm:px-7 py-5 overflow-y-auto overscroll-contain min-h-0 flex-1">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <FormField
                  label="Ad Soyad"
                  icon={User}
                  required
                  error={fieldErrors.fullName}
                >
                  <input
                    ref={firstFieldRef}
                    value={form.fullName}
                    onChange={setField("fullName")}
                    placeholder="Adınız ve soyadınız"
                    autoComplete="name"
                    className={`${inputCls} ${fieldErrors.fullName ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField
                  label="Otel / işletme adı"
                  icon={Building2}
                  required
                  error={fieldErrors.propertyName}
                >
                  <input
                    value={form.propertyName}
                    onChange={setField("propertyName")}
                    placeholder="Tesisinizin adı"
                    autoComplete="organization"
                    className={`${inputCls} ${fieldErrors.propertyName ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField
                  label="Telefon / WhatsApp"
                  icon={Phone}
                  required
                  error={fieldErrors.phoneWhatsApp}
                >
                  <input
                    type="tel"
                    value={form.phoneWhatsApp}
                    onChange={setField("phoneWhatsApp")}
                    placeholder="+90 532 000 00 00"
                    autoComplete="tel"
                    inputMode="tel"
                    className={`${inputCls} ${fieldErrors.phoneWhatsApp ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField label="Şehir" icon={MapPin} required error={fieldErrors.city}>
                  <input
                    value={form.city}
                    onChange={setField("city")}
                    placeholder="Örn. Antalya"
                    autoComplete="address-level2"
                    className={`${inputCls} ${fieldErrors.city ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField
                  label="Aylık ortalama oda sayısı"
                  icon={BarChart3}
                  optional
                  error={fieldErrors.avgMonthlyRooms}
                >
                  <input
                    value={form.avgMonthlyRooms}
                    onChange={setField("avgMonthlyRooms")}
                    placeholder="İsteğe bağlı — örn. 18"
                    inputMode="numeric"
                    className={`${inputCls} ${fieldErrors.avgMonthlyRooms ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField
                  label="En çok mesaj aldığınız kanal"
                  icon={Radio}
                  optional
                  error={fieldErrors.primaryMessageChannel}
                >
                  <select
                    value={form.primaryMessageChannel}
                    onChange={setField("primaryMessageChannel")}
                    className={`${inputCls} ${fieldErrors.primaryMessageChannel ? inputErrorCls : ""}`}
                  >
                    <option value="">İsteğe bağlı — seçin</option>
                    {(Object.keys(channelLabels) as DemoPrimaryChannel[]).map((k) => (
                      <option key={k} value={k}>
                        {channelLabels[k]}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Notunuz" icon={StickyNote} optional error={fieldErrors.notes}>
                  <textarea
                    value={form.notes}
                    onChange={setField("notes")}
                    placeholder="İsteğe bağlı — eklemek istediğiniz bir not"
                    rows={3}
                    className={`${inputCls} resize-none min-h-[88px] ${fieldErrors.notes ? inputErrorCls : ""}`}
                  />
                </FormField>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[15px] text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400/45 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  <Zap className="w-4 h-4 shrink-0" />
                  Talebi gönder
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-white/48 mb-2">
        <Icon className="w-3.5 h-3.5 opacity-70" />
        {label}
        {required && <span className="text-blue-400/90 ml-0.5">*</span>}
        {optional && (
          <span className="text-white/22 font-normal ml-1">(isteğe bağlı)</span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[11px] text-rose-400/95 leading-snug" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
