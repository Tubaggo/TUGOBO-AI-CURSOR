"use client";

import { useState } from "react";
import { Search, Bot, UserCheck, CheckCheck, Filter, Phone, Clock } from "lucide-react";
import { CONVERSATIONS, type ConversationStatus } from "../_components/mock-data";
import { StatusBadge, LeadBadge, LanguageFlag } from "../_components/badges";
import { cn } from "@/lib/utils";

type Tab = "all" | ConversationStatus;

const tabs: { id: Tab; label: string; count?: number }[] = [
  { id: "all", label: "All", count: 8 },
  { id: "ai_active", label: "AI Active", count: 4 },
  { id: "human_takeover", label: "Human", count: 2 },
  { id: "resolved", label: "Resolved", count: 2 },
];

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>("c1");

  const filtered = CONVERSATIONS.filter((c) => {
    const matchesTab = activeTab === "all" || c.status === activeTab;
    const matchesSearch =
      !search ||
      c.contact.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedConv = CONVERSATIONS.find((c) => c.id === selected);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left: conversation list */}
      <div className="w-[360px] shrink-0 flex flex-col border-r border-white/[0.05] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-semibold text-white">Conversations</h1>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI responding
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-2.5 bg-white/[0.05] border border-white/[0.07] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  activeTab === tab.id ? "bg-white/10 text-white/70" : "bg-white/[0.05] text-white/30"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv.id)}
              className={cn(
                "w-full text-left px-4 py-3.5 transition-colors border-l-2",
                selected === conv.id
                  ? "bg-white/[0.05] border-blue-500"
                  : "border-transparent hover:bg-white/[0.025]"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full ${conv.contact.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
                    {conv.contact.initials}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-sm font-medium", conv.unread > 0 ? "text-white" : "text-white/75")}>
                        {conv.contact.name}
                      </span>
                      <LanguageFlag lang={conv.language} />
                    </div>
                    <span className="text-[10px] text-white/25 shrink-0">{conv.time}</span>
                  </div>
                  <p className={cn("text-xs truncate mb-2", conv.unread > 0 ? "text-white/60" : "text-white/35")}>
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={conv.status} />
                    <LeadBadge status={conv.leadStatus} />
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-sm text-white/30">No conversations match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: conversation detail */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {selectedConv ? (
          <>
            {/* Detail header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedConv.contact.avatarColor} flex items-center justify-center text-xs font-bold text-white`}>
                  {selectedConv.contact.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">{selectedConv.contact.name}</h2>
                    <LanguageFlag lang={selectedConv.language} />
                    <StatusBadge status={selectedConv.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-white/35">
                      <Phone className="w-3 h-3" />
                      {selectedConv.contact.phone}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-white/35">
                      <Clock className="w-3 h-3" />
                      {selectedConv.messageCount} messages
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LeadBadge status={selectedConv.leadStatus} />
                {selectedConv.status === "ai_active" ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/15 transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                    Take over
                  </button>
                ) : selectedConv.status === "human_takeover" ? (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/15 transition-colors">
                    <Bot className="w-3.5 h-3.5" />
                    Hand back to AI
                  </button>
                ) : null}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
              <MockMessages conv={selectedConv} />
            </div>

            {/* Reply bar */}
            <div className="px-6 py-4 border-t border-white/[0.05]">
              {selectedConv.status === "ai_active" ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/[0.07] border border-blue-500/20 rounded-xl">
                  <Bot className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-sm text-blue-300/70 flex-1">
                    AI is responding automatically. Click <strong className="text-blue-300">Take over</strong> to reply manually.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                  <button className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors">
                    Send
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/20 text-sm">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MockMessages({ conv }: { conv: (typeof CONVERSATIONS)[0] }) {
  const messages = [
    { id: 1, direction: "inbound" as const, body: conv.lastMessage, time: conv.time },
    {
      id: 2,
      direction: "outbound" as const,
      body:
        conv.status === "resolved"
          ? "Thank you for your booking! Your reservation is confirmed. We look forward to welcoming you."
          : conv.leadStatus === "quoted"
          ? "Great news! I've checked our availability and we have the perfect room for you. Here's your personalised quote: 5 nights × $130 = **$650**. Shall I send a payment link?"
          : conv.leadStatus === "qualified"
          ? "Hello! I've checked our availability for those dates — we have availability. Could you tell me how many guests will be staying and which room type you prefer (Standard, Double, or Suite)?"
          : "Hello! Thank you for reaching out. I'm the AI concierge for Grand Hotel Demo. How can I help you today?",
      time: "just now",
    },
  ];

  return (
    <>
      <div className="flex justify-center">
        <span className="text-[11px] text-white/20 px-3 py-1 bg-white/[0.04] rounded-full">
          Today
        </span>
      </div>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}
        >
          {msg.direction === "inbound" && (
            <div className={`w-7 h-7 rounded-full ${conv.contact.avatarColor} flex items-center justify-center text-[10px] font-bold text-white mr-2.5 mt-1 shrink-0`}>
              {conv.contact.initials}
            </div>
          )}
          <div className={cn(
            "max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
            msg.direction === "inbound"
              ? "bg-white/[0.07] text-white/80 rounded-tl-sm"
              : "bg-blue-600 text-white rounded-tr-sm"
          )}>
            {msg.body}
            <p className={cn("text-[10px] mt-1.5", msg.direction === "inbound" ? "text-white/30" : "text-white/50")}>
              {msg.direction === "outbound" && (
                <>
                  <Bot className="inline w-2.5 h-2.5 mr-1 mb-0.5" />
                  AI ·{" "}
                </>
              )}
              {msg.time}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
