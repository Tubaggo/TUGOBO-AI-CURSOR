"use client";

import { useState } from "react";
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [saved, setSaved] = useState(false);
  const [persona, setPersona] = useState(
    "You are a friendly and professional AI concierge for Grand Hotel Demo. Be warm, helpful, and concise. Always respond in the language the guest uses. Keep replies under 4 sentences unless more detail is needed."
  );
  const [hotelName, setHotelName] = useState("Grand Hotel Demo");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [hours, setHours] = useState(defaultHours);

  async function handleSave() {
    setSaved(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelName, timezone, persona }),
      });
    } catch {
      // Swallow — UI feedback already shown
    }
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleDay(day: number) {
    setHours((h) => ({ ...h, [day]: { ...h[day], open: !h[day].open } }));
  }

  return (
    <div className="flex-1 overflow-auto">
    <div className="p-7 max-w-[820px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-white/40 mt-0.5">Configure your hotel, AI persona, and channels</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            saved
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>

      <div className="space-y-5">
        {/* Hotel Profile */}
        <Section icon={Building2} title="Hotel Profile" description="Basic information about your property">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Hotel name">
              <input
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Timezone">
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                {["Europe/Istanbul", "Europe/London", "Europe/Berlin", "America/New_York", "Asia/Dubai"].map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </Field>
            <Field label="Default language">
              <select className={inputCls}>
                <option>English</option>
                <option>Turkish</option>
                <option>German</option>
                <option>Russian</option>
              </select>
            </Field>
            <Field label="Contact email">
              <input
                defaultValue="contact@grandhoteldemo.com"
                type="email"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* AI Persona */}
        <Section icon={Bot} title="AI Persona" description="How the AI presents itself to guests">
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 px-3.5 py-3 bg-blue-500/[0.06] border border-blue-500/15 rounded-lg">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-300/70 leading-relaxed">
                The AI uses this persona in all guest conversations. It also responds in the guest's language automatically.
              </p>
            </div>
            <Field label="System persona">
              <textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                rows={4}
                className={cn(inputCls, "resize-none leading-relaxed")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="AI name shown to guests">
                <input defaultValue="Mia" className={inputCls} />
              </Field>
              <Field label="Confidence threshold for escalation">
                <select className={inputCls}>
                  <option>Low (&lt;50%) — escalate rarely</option>
                  <option>Medium (&lt;70%) — balanced</option>
                  <option>High (&lt;85%) — escalate often</option>
                </select>
              </Field>
            </div>
          </div>
        </Section>

        {/* Business Hours */}
        <Section icon={Clock3} title="Business Hours" description="AI responds 24/7. These hours control human-agent availability notifications.">
          <div className="space-y-2">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors",
                  hours[i].open
                    ? "bg-white/[0.03] border-white/[0.06]"
                    : "border-transparent"
                )}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "relative w-9 h-5 rounded-full transition-colors shrink-0",
                    hours[i].open ? "bg-blue-600" : "bg-white/[0.10]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                      hours[i].open ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
                <span className={cn("text-sm w-10 shrink-0", hours[i].open ? "text-white/80 font-medium" : "text-white/30")}>
                  {day}
                </span>
                {hours[i].open ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={hours[i].from}
                      onChange={(e) =>
                        setHours((h) => ({ ...h, [i]: { ...h[i], from: e.target.value } }))
                      }
                      className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50"
                    />
                    <span className="text-white/30 text-xs">to</span>
                    <input
                      type="time"
                      value={hours[i].to}
                      onChange={(e) =>
                        setHours((h) => ({ ...h, [i]: { ...h[i], to: e.target.value } }))
                      }
                      className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-white/25">Closed</span>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* WhatsApp Channel */}
        <Section icon={MessageSquare} title="WhatsApp Channel" description="Connected number and webhook status">
          <div className="space-y-4">
            {/* Status card */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/85">Twilio WhatsApp Sandbox</p>
                  <p className="text-xs text-white/35 mt-0.5">+1 415 523 8886</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-medium text-amber-400">Not connected</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <Field label="WhatsApp number" className="col-span-2">
                <input
                  placeholder="+14155238886"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="flex items-start gap-2.5 px-3.5 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg">
              <Wifi className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-white/50 font-medium">Webhook URL</p>
                <p className="text-xs text-white/30 font-mono mt-0.5">
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
    <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-white/50" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-white/35 mt-0.5">{description}</p>
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
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all";
