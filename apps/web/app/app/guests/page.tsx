import { getGuestIntelligenceMetrics, getGuests } from "@/lib/data/guests";
import { GuestList } from "./_components/guest-list";

export default function GuestsPage() {
  const initialGuests = getGuests();
  const metrics = getGuestIntelligenceMetrics();
  return <GuestList initialGuests={initialGuests} metrics={metrics} />;
}
