import { getReservations } from "@/lib/data/reservations";
import { ReservationsOrchestrationWorkspace } from "./_components/reservations-orchestration-workspace";

export default function ReservationsPage() {
  const initialReservations = getReservations();
  return <ReservationsOrchestrationWorkspace initialReservations={initialReservations} />;
}
