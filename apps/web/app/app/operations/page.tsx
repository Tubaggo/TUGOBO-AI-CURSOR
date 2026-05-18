"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  useOperationalRuntime,
  selectMounted,
  selectAlerts,
  selectOperationsFeed,
  selectRecoveryJourneys,
  selectConversations,
  selectAiImpact,
} from "@/stores/operational-runtime";
import { OperationalPageHeader } from "../_components/operational-page-header";
import {
  OperationalIntelligenceFeedItem,
  OperationsFeedRuntimeItem,
} from "../_components/operational-intelligence-feed";
import { RecoveryJourneyCard } from "../_components/recovery-journey-card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bot, Clock, Radio, UserCheck, Zap } from "lucide-react";

export default function OperationsPage() {
  const t = useTranslations("operations");
  const mounted = useOperationalRuntime(selectMounted);
  const alerts = useOperationalRuntime(selectAlerts);
  const feed = useOperationalRuntime(selectOperationsFeed);
  const journeys = useOperationalRuntime(selectRecoveryJourneys);
  const conversations = useOperationalRuntime(selectConversations);
  const aiImpact = useOperationalRuntime(selectAiImpact);
  const markAlertRead = useOperationalRuntime((s) => s.markAlertRead);

  const unreadAlerts = alerts.filter((a) => !a.read);
  const activeInterventions = journeys.filter((j) => j.status === "active");
  const staffTakeovers = conversations.filter((c) => c.flags.humanTakeover || c.status === "human_takeover");
  const slaRisks = conversations.filter(
    (c) => c.flags.paymentRisk || c.flags.vipEscalation || c.flags.recoveryActive
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-[1200px] p-7">
        <OperationalPageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          accent="violet"
        />

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <OpsStat
            icon={AlertTriangle}
            label={t("stats.unreadWarnings")}
            value={mounted ? String(unreadAlerts.length) : "—"}
            urgent={unreadAlerts.length > 0}
          />
          <OpsStat
            icon={Zap}
            label={t("stats.activeInterventions")}
            value={mounted ? String(activeInterventions.length) : "—"}
          />
          <OpsStat
            icon={UserCheck}
            label={t("stats.staffAssisting")}
            value={mounted ? String(staffTakeovers.length) : "—"}
          />
          <OpsStat
            icon={Bot}
            label={t("stats.supportLevel")}
            value={mounted ? `${aiImpact.aiConfidenceStability}%` : "—"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">{t("queue.title")}</h2>
                <p className="text-[11px] text-white/35">{t("queue.subtitle")}</p>
              </div>
              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300">
                {slaRisks.length} {t("slaWatch")}
              </span>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-[520px] overflow-y-auto conv-scroll">
              {alerts.map((alert) => (
                <OperationalIntelligenceFeedItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={!alert.read ? () => markAlertRead(alert.id) : undefined}
                />
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-cyan-500/12 bg-zinc-900">
              <div className="border-b border-white/[0.05] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-cyan-400" />
                  <h2 className="text-xs font-semibold text-white">{t("liveFeed")}</h2>
                </div>
              </div>
              <div className="max-h-[240px] overflow-y-auto conv-scroll divide-y divide-white/[0.03]">
                {feed.map((item) => (
                  <OperationsFeedRuntimeItem key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-white/[0.06] bg-zinc-900 p-4">
              <h2 className="mb-3 text-xs font-semibold text-white">{t("quickAccess")}</h2>
              <div className="flex flex-col gap-2">
                <QuickLink
                  href="/app/conversations"
                  label={t("quickLinks.conversations")}
                  sub={t("quickLinks.conversationsSub")}
                />
                <QuickLink
                  href="/app/payments"
                  label={t("quickLinks.payments")}
                  sub={t("quickLinks.paymentsSub")}
                />
                <QuickLink
                  href="/app/reservations"
                  label={t("quickLinks.reservations")}
                  sub={t("quickLinks.reservationsSub")}
                />
              </div>
            </section>
          </div>
        </div>

        {activeInterventions.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-4 text-sm font-semibold text-white">{t("activeInterventions")}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {activeInterventions.map((j) => (
                <RecoveryJourneyCard key={j.id} journey={j} />
              ))}
            </div>
          </section>
        ) : null}

        {staffTakeovers.length > 0 ? (
          <section className="mt-8 overflow-hidden rounded-xl border border-amber-500/15 bg-amber-500/[0.03]">
            <div className="border-b border-amber-500/10 px-5 py-3">
              <h2 className="text-sm font-semibold text-amber-200/90">{t("staffCoordination")}</h2>
              <p className="text-[11px] text-white/35">{t("staffCoordinationSub")}</p>
            </div>
            <ul className="divide-y divide-white/[0.04]">
              {staffTakeovers.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/app/conversations"
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white/88">{c.guestName}</p>
                      <p className="text-[11px] text-white/38">{c.lastMessage}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-300/80">
                      <Clock className="h-3 w-3" />
                      {c.time}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function OpsStat({
  icon: Icon,
  label,
  value,
  urgent,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        urgent ? "border-rose-500/20 bg-rose-500/[0.05]" : "border-white/[0.06] bg-zinc-900"
      )}
    >
      <Icon className={cn("mb-2 h-4 w-4", urgent ? "text-rose-400" : "text-violet-400")} />
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-xs text-white/40">{label}</p>
    </div>
  );
}

function QuickLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      <p className="text-xs font-medium text-white/75">{label}</p>
      <p className="text-[10px] text-white/32">{sub}</p>
    </Link>
  );
}
