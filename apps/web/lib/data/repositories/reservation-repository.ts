import { getReservations } from "../reservations";

export const reservationRepository = {
  findAll: getReservations,
  findById: (id: string) => getReservations().find((r) => r.id === id) ?? null,
};
