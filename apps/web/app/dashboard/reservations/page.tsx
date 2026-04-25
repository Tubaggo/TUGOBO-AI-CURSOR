"use client";

import { useState } from "react";
import {
  Search,
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Moon,
} from "lucide-react";
import { RESERVATIONS, type ReservationStatus } from "../_components/mock-data";
import { ResBadge } from "../_components/badges";
import { cn } from "@/lib/utils";

type Tab = "all" | ReservationStatus;

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New Leads" },
  { id: "quoted", label: "Quoted" },
  { id: "pending_payment", label: "Pending Payment" },
  { id: "confirmed", label: "Confirmed" },
  { id: "lost", label: "Lost" },
];

const summaryCards = [
  { label: "Total Leads", value: "6", icon: TrendingUp, iconColor: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Confirmed", value: "3", icon: CalendarDays, iconColor: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Pending Payment", value: "1", icon: DollarSign, iconColor: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Total Revenue", value: "$2,900", icon: DollarSign, iconColor: "text-blue-400", bg: "bg-blue-500/10" },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = RESERVATIONS.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch =
      !search ||
      r.guest.toLowerCase().includes(search.toLowerCase()) ||
      r.room.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-auto">
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold text-white">Reservations</h1>
          <p className="text-sm text-white/40 mt-0.5">Track every lead from first message to confirmed booking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors">
          + New reservation
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-zinc-900 border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-zinc-900 border border-white/[0.06] rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative ml-4 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-9 pr-3 py-2 bg-white/[0.05] border border-white/[0.07] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition-all w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {[
                  { label: "Guest", w: "" },
                  { label: "Room", w: "" },
                  { label: "Check-in", w: "" },
                  { label: "Check-out", w: "" },
                  { label: "Nights", w: "text-center" },
                  { label: "Guests", w: "text-center" },
                  { label: "Status", w: "" },
                  { label: "Amount", w: "text-right" },
                  { label: "Booked", w: "" },
                  { label: "", w: "" },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-5 py-3 text-left text-[11px] font-semibold text-white/25 uppercase tracking-wider ${h.w}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Guest */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.07] flex items-center justify-center text-[11px] font-bold text-white/60 shrink-0">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/85">{r.guest}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{r.channel}</p>
                      </div>
                    </div>
                  </td>
                  {/* Room */}
                  <td className="px-5 py-4 text-sm text-white/55">{r.room}</td>
                  {/* Check-in */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-white/55">
                      <CalendarDays className="w-3.5 h-3.5 text-white/25" />
                      {r.checkIn}
                    </div>
                  </td>
                  {/* Check-out */}
                  <td className="px-5 py-4 text-sm text-white/55">{r.checkOut}</td>
                  {/* Nights */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-white/55">
                      <Moon className="w-3 h-3 text-white/25" />
                      {r.nights}
                    </div>
                  </td>
                  {/* Guests */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-white/55">
                      <Users className="w-3 h-3 text-white/25" />
                      {r.guests}
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <ResBadge status={r.status} />
                  </td>
                  {/* Amount */}
                  <td className="px-5 py-4 text-right">
                    {r.amount ? (
                      <span className="text-sm font-semibold text-white/85">
                        ${r.amount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-white/25">—</span>
                    )}
                  </td>
                  {/* Booked at */}
                  <td className="px-5 py-4 text-xs text-white/30">{r.bookedAt}</td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === "pending_payment" && (
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[11px] font-medium hover:bg-amber-500/25 transition-colors whitespace-nowrap">
                          <ExternalLink className="w-3 h-3" />
                          Send link
                        </button>
                      )}
                      {r.status === "new" && (
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[11px] font-medium hover:bg-blue-500/25 transition-colors whitespace-nowrap">
                          Send quote
                        </button>
                      )}
                      {r.status === "confirmed" && (
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white/50 text-[11px] font-medium hover:bg-white/[0.08] transition-colors whitespace-nowrap">
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-white/25">No reservations match your filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05]">
          <p className="text-xs text-white/30">
            Showing {filtered.length} of {RESERVATIONS.length} reservations
          </p>
          <p className="text-xs text-white/30">
            Total revenue:{" "}
            <span className="text-white/60 font-medium">
              ${RESERVATIONS.filter((r) => r.amount).reduce((sum, r) => sum + (r.amount ?? 0), 0).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
