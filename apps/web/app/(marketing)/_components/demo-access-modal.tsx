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
import Link from "next/link";
import { z } from "zod";
import {
  X,
  CheckCircle2,
  Monitor,
  User,
  Building2,
  Phone,
  BedDouble,
  StickyNote,
  ArrowRight,
} from "lucide-react";

/** CRM / entegrasyon için — alan adları İngilizce */
export type DemoPreviewLeadPayload = {
  fullName: string;
  hotelOrBusinessName: string;
  whatsAppPhone: string;
  roomCount: string;
  notes: string | null;
  submittedAtIso: string;
};

export const DEMO_ACCESS_HASH = "#tugobo-preview-erisim";

/** Landing / chat için Link `href` — hash ile modal senkronu */
export const DEMO_ACCESS_LANDING_HREF = `/${DEMO_ACCESS_HASH}`;

const PUBLIC_DEMO_PANEL = "/demo/otel-paneli";

type DemoAccessFormState = {
  fullName: string;
  hotelOrBusinessName: string;
  whatsAppPhone: string;
  roomCount: string;
  notes: string;
};

const initialForm: DemoAccessFormState = {
  fullName: "",
  hotelOrBusinessName: "",
  whatsAppPhone: "",
  roomCount: "",
  notes: "",
};

const formSchema = z.object({
  fullName: z.string().trim().min(1, "Ad soyad gereklidir"),
  hotelOrBusinessName: z.string().trim().min(1, "Otel veya işletme adı gereklidir"),
  whatsAppPhone: z
    .string()
    .trim()
    .min(1, "WhatsApp numarası gereklidir")
    .refine((s) => s.replace(/\s/g, "").length >= 10, {
      message: "En az 10 karakter girin",
    }),
  roomCount: z
    .string()
    .trim()
    .min(1, "Oda sayısı gereklidir")
    .refine((s) => /^\d+$/.test(s) && parseInt(s, 10) > 0, {
      message: "Geçerli bir oda sayısı girin",
    }),
  notes: z.string(),
});

function toLeadPayload(values: z.infer<typeof formSchema>): DemoPreviewLeadPayload {
  return {
    fullName: values.fullName.trim(),
    hotelOrBusinessName: values.hotelOrBusinessName.trim(),
    whatsAppPhone: values.whatsAppPhone.trim(),
    roomCount: values.roomCount.trim(),
    notes: values.notes.trim() || null,
    submittedAtIso: new Date().toISOString(),
  };
}

function mapZodErrors(
  issue: z.ZodIssue[]
): Partial<Record<keyof DemoAccessFormState, string>> {
  const out: Partial<Record<keyof DemoAccessFormState, string>> = {};
  for (const i of issue) {
    const key = i.path[0];
    if (typeof key === "string" && key in initialForm && !out[key as keyof DemoAccessFormState]) {
      out[key as keyof DemoAccessFormState] = i.message;
    }
  }
  return out;
}

type DemoAccessModalContextValue = {
  openModal: () => void;
};

const DemoAccessModalContext = createContext<DemoAccessModalContextValue | null>(null);

/** Provider yoksa ana sayfadaki erişim anchor’una yönlendirir. */
export function useOpenDemoAccessModal(): () => void {
  const ctx = useContext(DemoAccessModalContext);
  return useCallback(() => {
    if (ctx) ctx.openModal();
    else if (typeof window !== "undefined") {
      window.location.assign("/" + DEMO_ACCESS_HASH);
    }
  }, [ctx]);
}

export function DemoAccessModalProvider({ children }: { children: ReactNode }) {
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
      if (window.location.hash === DEMO_ACCESS_HASH) {
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
    <DemoAccessModalContext.Provider value={{ openModal }}>
      {children}
      {mounted &&
        open &&
        createPortal(<DemoAccessModal onClose={closeModal} />, document.body)}
    </DemoAccessModalContext.Provider>
  );
}

export function DemoAccessButton({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ctx = useContext(DemoAccessModalContext);
  if (!ctx) {
    throw new Error("DemoAccessButton must be used within DemoAccessModalProvider");
  }
  return (
    <button type="button" id={id} onClick={() => ctx.openModal()} className={className}>
      {children}
    </button>
  );
}

const inputCls =
  "w-full px-4 py-3 bg-white/[0.05] border border-white/[0.09] rounded-xl text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/35 focus:border-blue-500/50 focus:bg-white/[0.08] transition-all";

const inputErrorCls = "border-rose-500/45 focus:border-rose-500/55 focus:ring-rose-500/20";

function DemoAccessModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const descId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState<DemoAccessFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof DemoAccessFormState, string>>
  >({});

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

  function setField<K extends keyof DemoAccessFormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value as DemoAccessFormState[K];
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
    const _lead: DemoPreviewLeadPayload = toLeadPayload(parsed.data);
    void _lead;
    setStep("success");
  }

  function handleClose() {
    setStep("form");
    setForm(initialForm);
    setFieldErrors({});
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-[10px] animate-demo-backdrop-in"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full sm:max-w-[500px] max-h-[92dvh] sm:max-h-[min(90vh,780px)] bg-zinc-900 border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/70 flex flex-col animate-demo-panel-in mt-auto sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
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
              Demo erişiminiz hazır.
            </h3>
            <p id={descId} className="text-[14px] text-white/50 leading-relaxed mb-8 max-w-sm mx-auto">
              Örnek operasyon paneli gösterim verisiyle açılır; canlı kurulumda kendi kanallarınız ve
              politikalarınız bağlanır.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link
                href={PUBLIC_DEMO_PANEL}
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[14px] text-white transition-all active:scale-[0.99] shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400/45 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Örnek operasyon panelini görüntüle
                <ArrowRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[13px] font-semibold text-white/75 hover:bg-white/[0.10] hover:border-white/[0.18] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/35"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 sm:px-7 pt-6 pb-4 shrink-0 border-b border-white/[0.06]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-400/75 mb-2">
                Hotel Operating Intelligence Preview
              </p>
              <h2
                id={titleId}
                className="text-[21px] sm:text-[22px] font-bold text-white leading-snug pr-10"
              >
                Canlı ürün önizlemesi
              </h2>
              <p id={descId} className="text-[13px] text-white/42 leading-relaxed mt-2">
                Örnek operasyon paneline geçmeden önce kısa bilgilerinizi paylaşın; ekibimiz
                işletmenize uygun kurulumu değerlendirmek için bu kaydı kullanır.
              </p>
              <p className="text-[11px] text-white/28 mt-3 leading-relaxed">
                Verileriniz yalnızca talep kapsamında işlenir · Taahhüt yok
              </p>
            </div>

            <div className="px-6 sm:px-7 py-5 overflow-y-auto overscroll-contain min-h-0 flex-1">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <FormField label="Ad Soyad" icon={User} required error={fieldErrors.fullName}>
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
                  error={fieldErrors.hotelOrBusinessName}
                >
                  <input
                    value={form.hotelOrBusinessName}
                    onChange={setField("hotelOrBusinessName")}
                    placeholder="Tesis veya marka adı"
                    autoComplete="organization"
                    className={`${inputCls} ${fieldErrors.hotelOrBusinessName ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField
                  label="WhatsApp"
                  icon={Phone}
                  required
                  error={fieldErrors.whatsAppPhone}
                >
                  <input
                    type="tel"
                    value={form.whatsAppPhone}
                    onChange={setField("whatsAppPhone")}
                    placeholder="+90 532 000 00 00"
                    autoComplete="tel"
                    inputMode="tel"
                    className={`${inputCls} ${fieldErrors.whatsAppPhone ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField
                  label="Oda sayısı"
                  icon={BedDouble}
                  required
                  error={fieldErrors.roomCount}
                >
                  <input
                    value={form.roomCount}
                    onChange={setField("roomCount")}
                    placeholder="Örn. 24"
                    inputMode="numeric"
                    className={`${inputCls} ${fieldErrors.roomCount ? inputErrorCls : ""}`}
                  />
                </FormField>

                <FormField label="Not" icon={StickyNote} optional error={fieldErrors.notes}>
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
                  <Monitor className="w-4 h-4 shrink-0 opacity-90" />
                  Önizlemeyi aç
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
