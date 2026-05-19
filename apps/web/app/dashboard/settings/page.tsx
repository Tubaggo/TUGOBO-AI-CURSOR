"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Building2,
  Bot,
  Clock3,
  MessageSquare,
  Check,
  Wifi,
  WifiOff,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

const defaultHours: Record<number, { open: boolean; from: string; to: string }> = {
  0: { open: false, from: "09:00", to: "18:00" },
  1: { open: true, from: "09:00", to: "22:00" },
  2: { open: true, from: "09:00", to: "22:00" },
  3: { open: true, from: "09:00", to: "22:00" },
  4: { open: true, from: "09:00", to: "22:00" },
  5: { open: true, from: "09:00", to: "22:00" },
  6: { open: true, from: "10:00", to: "20:00" },
};

export default function SettingsPage() {
  const pathname = usePathname();
  const isSalesPreview = pathname.startsWith("/demo/otel-paneli");

  const [saved, setSaved] = useState(false);
  const [persona, setPersona] = useState(
    "Tugobo AI, otel ekibine destek veren profesyonel bir dijital operasyon asistanıdır. Misafirin dilinde yanıt ver, net ve kısa kal, rezervasyon ile ödeme adımlarını kontrollü ilerlet ve gerektiğinde insan desteğine yönlendir."
  );
  const [hotelName, setHotelName] = useState("Pilot Otel");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [hours, setHours] = useState(defaultHours);

  async function handleSave() {
    setSaved(true);
    if (!isSalesPreview) {
      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotelName, timezone, persona }),
        });
      } catch {
        // UI bildirimi zaten gösterildi.
      }
    }
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleDay(day: number) {
    setHours((h) => ({ ...h, [day]: { ...h[day], open: !h[day].open } }));
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-[820px] p-5 sm:p-7">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isSalesPreview ? (
              <p className="mb-2 text-[11px] leading-relaxed text-white/38">
                Örnek ayarlar - canlı hesapta kendi kayıtlarınız ve entegrasyonlarınız kullanılır.
              </p>
            ) : null}
            <h1 className="text-xl font-semibold text-white">Ayarlar</h1>
            <p className="mt-0.5 text-sm text-white/40">
              Otel bilgilerini, AI destek tonunu ve kanal bağlantılarını yönetin.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all sm:w-auto",
              saved
                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                : "bg-blue-600 text-white hover:bg-blue-500"
            )}
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Kaydedildi
              </>
            ) : (
              "Değişiklikleri kaydet"
            )}
          </button>
        </div>

        <div className="space-y-5">
          <Section icon={Building2} title="Otel profili" description="Tesisin temel operasyon bilgileri">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Otel adı">
                <input
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Saat dilimi">
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                  {["Europe/Istanbul", "Europe/London", "Europe/Berlin", "America/New_York", "Asia/Dubai"].map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Varsayılan dil">
                <select className={inputCls}>
                  <option>Türkçe</option>
                  <option>English</option>
                  <option>Deutsch</option>
                  <option>Русский</option>
                </select>
              </Field>
              <Field label="İletişim e-postası">
                <input defaultValue="iletisim@pilototel.com" type="email" className={inputCls} />
              </Field>
            </div>
          </Section>

          <Section icon={Bot} title="AI destek tonu" description="AI'ın misafire nasıl görüneceğini belirleyin">
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/15 bg-blue-500/[0.06] px-3.5 py-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <p className="text-xs leading-relaxed text-blue-300/70">
                  Bu tanım tüm misafir görüşmelerinde kullanılır. Sistem, misafirin diline göre otomatik yanıt vermeye devam eder.
                </p>
              </div>
              <Field label="Sistem tanımı">
                <textarea
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  rows={4}
                  className={cn(inputCls, "resize-none leading-relaxed")}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Misafire görünen AI adı">
                  <input defaultValue="Tugobo AI" className={inputCls} />
                </Field>
                <Field label="İnsan destek eşiği">
                  <select className={inputCls}>
                    <option>Düşük (&lt;50%) - nadiren yönlendir</option>
                    <option>Orta (&lt;70%) - dengeli</option>
                    <option>Yüksek (&lt;85%) - sık yönlendir</option>
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          <Section
            icon={Clock3}
            title="Çalışma saatleri"
            description="AI destek 7/24 çalışır. Bu saatler insan destek bildirimlerini belirler."
          >
            <div className="space-y-2">
              {DAY_LABELS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    "flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 transition-colors",
                    hours[i].open ? "border-white/[0.06] bg-white/[0.03]" : "border-transparent"
                  )}
                >
                  <button
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                      hours[i].open ? "bg-blue-600" : "bg-white/[0.10]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        hours[i].open ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </button>
                  <span
                    className={cn(
                      "w-10 shrink-0 text-sm",
                      hours[i].open ? "font-medium text-white/80" : "text-white/30"
                    )}
                  >
                    {day}
                  </span>
                  {hours[i].open ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <input
                        type="time"
                        value={hours[i].from}
                        onChange={(e) =>
                          setHours((h) => ({ ...h, [i]: { ...h[i], from: e.target.value } }))
                        }
                        className="rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-xs text-white focus:border-blue-500/50 focus:outline-none"
                      />
                      <span className="text-xs text-white/30">-</span>
                      <input
                        type="time"
                        value={hours[i].to}
                        onChange={(e) =>
                          setHours((h) => ({ ...h, [i]: { ...h[i], to: e.target.value } }))
                        }
                        className="rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-xs text-white focus:border-blue-500/50 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-white/25">Kapalı</span>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section icon={MessageSquare} title="WhatsApp kanalı" description="Bağlı numara ve webhook durumu">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25D366]/10">
                    <MessageSquare className="h-4.5 w-4.5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/85">Twilio WhatsApp hattı</p>
                    <p className="mt-0.5 text-xs text-white/35">+1 415 523 8886</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                    <WifiOff className="h-3 w-3 text-amber-400" />
                    <span className="text-[11px] font-medium text-amber-400">Bağlı değil</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Twilio Account SID">
                  <input
                    type="password"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={inputCls}
                  />
                </Field>
                <Field label="Twilio Auth Token">
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••"
                    className={inputCls}
                  />
                </Field>
                <Field label="WhatsApp numarası" className="md:col-span-2">
                  <input placeholder="+14155238886" className={inputCls} />
                </Field>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3.5 py-3">
                <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                <div>
                  <p className="text-xs font-medium text-white/50">Webhook adresi</p>
                  <p className="mt-0.5 font-mono text-xs text-white/30">
                    https://your-domain.com/api/webhooks/twilio
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900">
      <div className="flex items-center gap-3 border-b border-white/[0.05] px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
          <Icon className="h-4 w-4 text-white/50" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-white/35">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 transition-all focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none";
