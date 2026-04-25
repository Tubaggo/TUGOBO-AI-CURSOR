import Link from "next/link";
import {
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Bot,
  Clock,
  Zap,
  ChevronRight,
} from "lucide-react";
import { CONVERSATIONS, RESERVATIONS } from "./_components/mock-data";
import { StatusBadge, LeadBadge, LanguageFlag } from "./_components/badges";

const metrics = [
  {
    label: "Conversations Today",
    value: "24",
    delta: "+18%",
    positive: true,
    icon: MessageSquare,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    sub: "vs yesterday",
  },
  {
    label: "Active Leads",
    value: "11",
    delta: "+3",
    positive: true,
    icon: TrendingUp,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    sub: "since this morning",
  },
  {
    label: "Confirmed Today",
    value: "4",
    delta: "+2",
    positive: true,
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    sub: "reservations",
  },
  {
    label: "Revenue Today",
    value: "$3,680",
    delta: "+$1,200",
    positive: true,
    icon: DollarSign,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    sub: "vs yesterday",
  },
];

const aiStats = [
  { label: "AI Response Rate", value: "94%", bar: 94 },
  { label: "Avg. Response Time", value: "8s", bar: 92 },
  { label: "Lead Qualification", value: "78%", bar: 78 },
  { label: "Conversion Rate", value: "33%", bar: 33 },
];

export default function DashboardPage() {
  const recentConvs = CONVERSATIONS.slice(0, 5);
  const recentRes = RESERVATIONS.slice(0, 4);

  return (
    <div className="flex-1 overflow-auto">
    <div className="p-7 max-w-[1300px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Good morning 👋</h1>
          <p className="text-sm text-white/40 mt-0.5">
            Saturday, Apr 25 · Grand Hotel Demo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">AI Active</span>
          </div>
          <Link
            href="/dashboard/conversations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-xs font-medium text-white"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Open Inbox
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-zinc-900 border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${m.iconBg} flex items-center justify-center`}>
                <m.icon className={`w-4.5 h-4.5 ${m.iconColor}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                {m.delta}
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
            <p className="text-xs text-white/40 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-[1fr_340px] gap-5 mb-5">
        {/* Recent conversations */}
        <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-white/40" />
              <h2 className="text-sm font-semibold text-white">Recent Conversations</h2>
            </div>
            <Link
              href="/dashboard/conversations"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentConvs.map((conv) => (
              <Link
                key={conv.id}
                href="/dashboard/conversations"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.025] transition-colors group"
              >
                <div className={`w-9 h-9 rounded-full ${conv.contact.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {conv.contact.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/90">{conv.contact.name}</span>
                      <LanguageFlag lang={conv.language} />
                    </div>
                    <span className="text-[11px] text-white/30 shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{conv.lastMessage}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={conv.status} />
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Performance */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">AI Performance</h2>
                <p className="text-[11px] text-white/35">Last 7 days</p>
              </div>
            </div>
            <div className="space-y-4">
              {aiStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/50">{stat.label}</span>
                    <span className="text-xs font-semibold text-white">{stat.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                      style={{ width: `${stat.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-4">Today at a glance</h3>
            {[
              { icon: Zap, label: "AI messages sent", value: "87", color: "text-blue-400" },
              { icon: Clock, label: "Avg. lead-to-quote", value: "4 min", color: "text-violet-400" },
              { icon: CheckCircle2, label: "Human takeovers", value: "3", color: "text-amber-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="text-xs text-white/50">{item.label}</span>
                </div>
                <span className="text-xs font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-semibold text-white">Recent Reservations</h2>
          <Link
            href="/dashboard/reservations"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {["Guest", "Room", "Check-in", "Check-out", "Guests", "Status", "Amount"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentRes.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] font-bold text-white/60">
                        {r.initials}
                      </div>
                      <span className="text-sm text-white/80 font-medium">{r.guest}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{r.room}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{r.checkIn}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{r.checkOut}</td>
                  <td className="px-5 py-3.5 text-sm text-white/50">{r.guests}</td>
                  <td className="px-5 py-3.5">
                    <ReservationBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-white/80">
                    {r.amount ? `$${r.amount.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}

function ReservationBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    pending_payment: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    quoted: { label: "Quoted", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    new: { label: "New", cls: "bg-white/[0.07] text-white/50 border-white/[0.08]" },
    lost: { label: "Lost", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  };
  const s = map[status] ?? map.new;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}
