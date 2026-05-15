import { notFound } from "next/navigation";
import { getReservationById } from "@/lib/data/reservations";
import { ReservationDetail } from "../_components/reservation-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getReservationById(id);
  if (!detail) {
    notFound();
  }
  return <ReservationDetail detail={detail} />;
}
