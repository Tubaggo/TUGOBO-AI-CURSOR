import type { HotelRole } from "@/app/app/_types";

const LABELS: Record<HotelRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  viewer: "Viewer",
};

export function hotelRoleLabel(role: HotelRole): string {
  return LABELS[role];
}
