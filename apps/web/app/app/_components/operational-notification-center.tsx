"use client";

import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import {
  useOperationsStore,
  useOperationalNotifications,
  useUnreadNotificationCount,
} from "@/store/operations-store";
import type {
  OperationalNotification,
  NotificationSeverity,
} from "@/lib/runtime/operational-notifications";
import { StaffWorkloadPanel } from "./staff-workload-panel";

const SEVERITY_TONE: Record<NotificationSeverity, string> = {
  info: "border-white/12 text-white/50",
  warning: "border-amber-500/30 text-amber-200/90",
  critical: "border-rose-500/40 text-rose-200/90",
};

const KIND_LABEL: Record<OperationalNotification["kind"], string> = {
  escalation: "Escalation",
  payment_failure: "Payment",
  human_takeover: "Human takeover",
  reservation_confirmation: "Reservation",
  vip_arrival: "VIP",
  low_confidence: "AI confidence",
  payment_link: "Payment",
  policy_trigger: "Policy",
};

function entityHref(n: OperationalNotification): string | null {
  if (n.conversationId) return `/app/conversations/${n.conversationId}`;
  if (n.reservationId) return `/app/reservations/${n.reservationId}`;
  if (n.guestId) return `/app/guests/${n.guestId}`;
  if (n.escalationId) return `/app/ai-brain/escalations#esc-${n.escalationId}`;
  return null;
}

type NotificationRowProps = {
  item: OperationalNotification;
  onClose: () => void;
};

function NotificationRow({ item, onClose }: NotificationRowProps) {
  const markRead = useOperationsStore((s) => s.markNotificationRead);
  const router = useRouter();
  const href = entityHref(item);

  return (
    <div
      className={cn(
        "border-b border-white/[0.05] px-3 py-2.5",
        !item.read && "bg-white/[0.03]"
      )}
    >
      <RowHeader item={item} />
      <p className="mt-1 text-[11px] leading-snug text-white/42">{item.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/32">
        <span className="tabular-nums">
          {new Date(item.createdAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {item.assignedStaff ? (
          <span className="rounded border border-white/[0.08] px-1.5 py-px text-white/45">
            {item.assignedStaff}
          </span>
        ) : null}
        <span
          className={cn(
            "rounded border px-1.5 py-px font-semibold uppercase tracking-wide",
            item.actionStatus === "resolved"
              ? "border-emerald-500/25 text-emerald-200/80"
              : item.actionStatus === "in_progress"
                ? "border-amber-500/25 text-amber-200/80"
                : "border-white/[0.08] text-white/40"
          )}
        >
          {item.actionStatus.replace("_", " ")}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        {href ? (
          <button
            type="button"
            className="text-[10px] font-semibold text-cyan-300/80 hover:text-cyan-200"
            onClick={() => {
              markRead(item.id);
              onClose();
              router.push(href);
            }}
          >
            Open linked entity →
          </button>
        ) : null}
        {!item.read ? (
          <button
            type="button"
            className="text-[10px] text-white/35 hover:text-white/55"
            onClick={() => markRead(item.id)}
          >
            Mark read
          </button>
        ) : null}
      </div>
    </div>
  );
}

function RowHeader({ item }: { item: OperationalNotification }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
          {KIND_LABEL[item.kind]}
        </p>
        <p className="text-[12px] font-semibold leading-snug text-white/88">{item.title}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
          SEVERITY_TONE[item.severity]
        )}
      >
        {item.severity}
      </span>
    </div>
  );
}

export function OperationalNotificationCenter() {
  const mounted = useClientMounted();
  const [open, setOpen] = useState(false);
  const unread = useUnreadNotificationCount();
  const notifications = useOperationalNotifications(24);
  const markAllRead = useOperationsStore((s) => s.markAllNotificationsRead);

  const grouped = useMemo(() => {
    const openItems = notifications.filter(
      (n) => n.actionStatus !== "resolved" && n.actionStatus !== "dismissed"
    );
    const resolved = notifications.filter((n) => n.actionStatus === "resolved");
    return { openItems, resolved: resolved.slice(0, 6) };
  }, [notifications]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/48 sm:flex"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </button>
    );
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/48 transition-colors hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white/70 sm:flex"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 flex w-[min(100vw-1rem,380px)] flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-zinc-950 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
                Operational notifications
              </p>
              <p className="text-xs text-white/55">{unread} require attention</p>
            </div>
            <button
              type="button"
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] px-2 py-1 text-[10px] font-semibold text-white/50 hover:bg-white/[0.05] hover:text-white/75"
            >
              <CheckCheck className="h-3 w-3" aria-hidden />
              Mark all read
            </button>
          </div>
          <div className="max-h-[min(52vh,360px)] overflow-y-auto">
            {grouped.openItems.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-white/38">
                No open operational signals.
              </p>
            ) : (
              grouped.openItems.map((n) => (
                <NotificationRow key={n.id} item={n} onClose={() => setOpen(false)} />
              ))
            )}
            {grouped.resolved.length > 0 ? (
              <div className="border-t border-white/[0.06] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/28">
                  Recently resolved
                </p>
                {grouped.resolved.map((n) => (
                  <NotificationRow key={n.id} item={n} onClose={() => setOpen(false)} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="border-t border-white/[0.07] p-3">
            <StaffWorkloadPanel compact />
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
