import type { EscalationEvent } from "@/lib/types/ai-brain";
import type { StaffAssignment } from "@/lib/entities";
import type { OperationalNotification } from "./operational-notifications";

export const STAFF_ROSTER_IDS = [
  "staff_ops_lead",
  "staff_revenue",
  "staff_front_desk",
  "staff_night",
  "staff_concierge",
] as const;

export type StaffRosterId = (typeof STAFF_ROSTER_IDS)[number];

export type StaffRosterMember = {
  id: StaffRosterId;
  name: string;
  desk: string;
  availability: "available" | "focused" | "at_capacity" | "offline";
  currentFocus: string;
};

export const STAFF_ROSTER: StaffRosterMember[] = [
  {
    id: "staff_ops_lead",
    name: "Ops Lead",
    desk: "Operations command",
    availability: "focused",
    currentFocus: "Escalation mesh + SLA ownership",
  },
  {
    id: "staff_revenue",
    name: "Revenue Desk",
    desk: "Revenue & payments",
    availability: "at_capacity",
    currentFocus: "Payment recovery ladder",
  },
  {
    id: "staff_front_desk",
    name: "Front Desk",
    desk: "Guest-facing desk",
    availability: "available",
    currentFocus: "Inbound thread triage",
  },
  {
    id: "staff_night",
    name: "Night Shift",
    desk: "Overnight operations",
    availability: "available",
    currentFocus: "Late arrival confirmations",
  },
  {
    id: "staff_concierge",
    name: "Concierge Lead",
    desk: "VIP & experiences",
    availability: "focused",
    currentFocus: "VIP arrival preparation",
  },
];

export type StaffWorkloadView = StaffRosterMember & {
  activeAssignments: number;
  escalationsOwned: number;
  openNotifications: number;
  responseLoad: "low" | "medium" | "high";
};

function loadBand(count: number): StaffWorkloadView["responseLoad"] {
  if (count >= 5) return "high";
  if (count >= 2) return "medium";
  return "low";
}

export function deriveStaffWorkload(args: {
  staffAssignments: StaffAssignment[];
  escalations: EscalationEvent[];
  notifications: OperationalNotification[];
}): StaffWorkloadView[] {
  const { staffAssignments, escalations, notifications } = args;

  return STAFF_ROSTER.map((member) => {
    const name = member.name;
    const activeAssignments = staffAssignments.filter(
      (a) => a.staffName === name && a.state !== "supervisor_routed"
    ).length;
    const escalationsOwned = escalations.filter(
      (e) => !e.resolved && e.assignedOwner === name
    ).length;
    const openNotifications = notifications.filter(
      (n) => n.assignedStaff === name && !n.read && n.actionStatus === "open"
    ).length;
    const loadScore = activeAssignments + escalationsOwned + openNotifications;

    let availability = member.availability;
    if (loadScore >= 6) availability = "at_capacity";
    else if (loadScore >= 3) availability = "focused";

    return {
      ...member,
      availability,
      activeAssignments,
      escalationsOwned,
      openNotifications,
      responseLoad: loadBand(loadScore),
    };
  });
}

export function defaultOwnerForEscalation(reason: EscalationEvent["reason"]): string {
  switch (reason) {
    case "payment_friction":
      return "Revenue Desk";
    case "vip_complaint_risk":
      return "Concierge Lead";
    case "human_takeover":
      return "Front Desk";
    case "low_confidence_quote":
      return "Ops Lead";
    default:
      return "Ops Lead";
  }
}
