import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Building2,
  Sparkles,
  Settings,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const APP_BASE = "/app";

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: `${APP_BASE}/overview`, label: "Overview", icon: LayoutDashboard },
  { href: `${APP_BASE}/conversations`, label: "Conversations", icon: MessageSquare },
  { href: `${APP_BASE}/reservations`, label: "Reservations", icon: Calendar },
  { href: `${APP_BASE}/guests`, label: "Guests", icon: Users },
  { href: `${APP_BASE}/property`, label: "Property", icon: Building2 },
  { href: `${APP_BASE}/ai-brain`, label: "AI Brain", icon: Sparkles },
  { href: `${APP_BASE}/settings`, label: "Settings", icon: Settings },
];
