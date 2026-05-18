"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowRightLeft,
  CreditCard,
  Link2,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import {
  useOperationalRuntime,
  selectMounted,
  selectReservations,
  selectRecoveryJourneys,
  selectRevenueMetrics,
  selectOtaMetrics,
} from "@/stores/operational-runtime";
import { OperationalPageHeader } from "../_components/operational-page-header";
import { RecoveryJourneyCard } from "../_components/recovery-journey-card";
import { formatEur } from "@/lib/operational/format";
import { lifecycleStageLabel } from "@/lib/i18n/operational-copy";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/runtime/entities";

const PAYMENT_STAGES = ["payment_pending", "payment_risk", "recovery", "quote"] as const;

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const mounted = useOperationalRuntime(selectMounted);
  const reservations = useOperationalRuntime(selectReservations);
  const journeys = useOperationalRuntime(selectRecoveryJourneys);
  const metrics = useOperationalRuntime(selectRevenueMetrics);
  const ota = useOperationalRuntime(selectOtaMetrics);

  const paymentReservations = useMemo(
    () => reservations.filter((r) => (PAYMENT_STAGES as readonly string[]).includes(r.currentStage)),
    [reservations]
  );

  const paymentRecoveries = journeys.filter(
    (j) => j.kind === "failed_payment" || j.kind === "abandoned_booking" || j.kind === "ota_to_direct"
  );

  const pendingCount = paymentReservations.filter(
    (r) => r.currentStage === "payment_pending" || r.currentStage === "quote"
  ).length;
  const atRiskCount = paymentReservations.filter((r) => r.currentStage === "payment_risk").length;
  const activeRecovery = paymentRecoveries.filter((j) => j.status === "active").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-[1200px] p-7">
        <OperationalPageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          accent="amber"
        />

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <FinanceCard
            icon={CreditCard}
            label={t("cards.pending")}
            value={mounted ? String(pendingCount) : "—"}
            sub={t("cards.pendingSub")}
            tone="amber"
          />
          <FinanceCard
            icon={ShieldAlert}
            label={t("cards.atRisk")}
            value={mounted ? String(atRiskCount) : "—"}
            sub={t("cards.atRiskSub")}
            tone="rose"
          />
          <FinanceCard
            icon={RefreshCw}
            label={t("cards.activeRecovery")}
            value={mounted ? String(activeRecovery) : "—"}
            sub={t("cards.activeRecoverySub")}
            tone="violet"
          />
          <FinanceCard
            icon={Wallet}
            label={t("cards.recoveredToday")}
            value={mounted ? formatEur(metrics.paymentRecoveryRevenue, true) : "—"}
            sub={t("cards.recoveredTodaySub")}
            tone="emerald"
          />
        </div>

        <div className="mb-8 grid gap-5 lg:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-amber-500/12 bg-gradient-to-b from-amber-500/[0.04] to-zinc-900">
            <div className="border-b border-white/[0.05] px-5 py-4">
              <h2 className="text-sm font-semibold text-white">{t("pendingSection.title")}</h2>
              <p className="text-[11px] text-white/35">{t("pendingSection.subtitle")}</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {paymentReservations.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-white/30">{t("empty")}</p>
              ) : (
                paymentReservations.map((r) => <PaymentRow key={r.id} reservation={r} />)
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-violet-500/12 bg-zinc-900">
            <div className="border-b border-white/[0.05] px-5 py-4">
              <h2 className="text-sm font-semibold text-white">{t("otaSection.title")}</h2>
              <p className="text-[11px] text-white/35">{t("otaSection.subtitle")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <MiniStat
                label={t("otaSection.commissionAvoided")}
                value={mounted ? formatEur(ota.recoveredCommissionSavings, true) : "—"}
              />
              <MiniStat
                label={t("otaSection.directConversion")}
                value={mounted ? `${ota.directConversionRate}%` : "—"}
              />
              <MiniStat
                label={t("otaSection.otaRisk")}
                value={mounted ? `${ota.otaLeakagePct}%` : "—"}
              />
              <MiniStat
                label={t("otaSection.activeRecoveries")}
                value={mounted ? String(ota.activeRecoveryWorkflows) : "—"}
              />
            </div>
            <div className="border-t border-white/[0.04] px-5 py-3">
              <Link
                href="/app/conversations"
                className="flex items-center gap-2 text-xs font-medium text-violet-300/90 hover:text-violet-200"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                {t("otaSection.viewConversations")}
              </Link>
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">{t("recoverySection.title")}</h2>
            <p className="text-[11px] text-white/35">{t("recoverySection.subtitle")}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {paymentRecoveries.map((j) => (
              <RecoveryJourneyCard key={j.id} journey={j} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FinanceCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
  sub: string;
  tone: "amber" | "rose" | "violet" | "emerald";
}) {
  const tones = {
    amber: "border-amber-500/15 bg-amber-500/[0.04] text-amber-400",
    rose: "border-rose-500/15 bg-rose-500/[0.04] text-rose-400",
    violet: "border-violet-500/15 bg-violet-500/[0.04] text-violet-400",
    emerald: "border-emerald-500/15 bg-emerald-500/[0.04] text-emerald-400",
  };
  return (
    <div className={cn("rounded-xl border p-4", tones[tone].split(" ").slice(0, 2).join(" "))}>
      <Icon className={cn("mb-2 h-4 w-4", tones[tone].split(" ")[2])} />
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-white/55">{label}</p>
      <p className="text-[10px] text-white/28">{sub}</p>
    </div>
  );
}

function PaymentRow({ reservation: r }: { reservation: Reservation }) {
  const t = useTranslations("payments");
  const isRisk = r.currentStage === "payment_risk";
  const href = r.conversationId ? `/app/conversations` : "/app/reservations";

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            isRisk ? "border-amber-500/25 bg-amber-500/10" : "border-blue-500/20 bg-blue-500/10"
          )}
        >
          {isRisk ? (
            <AlertCircle className="h-4 w-4 text-amber-400" />
          ) : (
            <Link2 className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white/90">{r.guest}</p>
          <p className="text-xs text-white/40">
            {r.room} · {r.checkIn} – {r.checkOut}
          </p>
          {isRisk ? (
            <p className="mt-1 text-[10px] font-medium text-amber-300/80">
              {t("monitoring", { amount: formatEur(r.revenueAtRiskEur) })}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-blue-300/70">{t("linkActive")}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 pl-11 sm:pl-0">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            isRisk
              ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
              : "border-white/10 bg-white/[0.04] text-white/50"
          )}
        >
          {lifecycleStageLabel(r.currentStage)}
        </span>
        <span className="text-sm font-bold tabular-nums text-white">{formatEur(r.bookingValueEur)}</span>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <p className="text-lg font-bold tabular-nums text-white">{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}

