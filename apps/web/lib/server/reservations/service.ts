import { conversations, db, eq, reservations, type DB } from "@tugobo/db";
import type { ReservationStatus } from "@tugobo/shared";

function assertDb(): DB {
  if (!db) throw new Error("database_not_configured");
  return db;
}

export type CreateReservationInput = {
  conversationId: string;
  hotelId: string;
  roomType?: string;
  totalAmount?: string;
  currency?: string;
  status?: ReservationStatus;
};

export async function createReservationFromConversation(input: CreateReservationInput) {
  const database = assertDb();

  const [conv] = await database
    .select()
    .from(conversations)
    .where(eq(conversations.id, input.conversationId))
    .limit(1);

  if (!conv) throw new Error("conversation_not_found");

  const now = new Date().toISOString();
  const status = input.status ?? "pending_payment";

  const [row] = await database
    .insert(reservations)
    .values({
      hotelId: input.hotelId,
      contactId: conv.contactId,
      conversationId: input.conversationId,
      status,
      roomType: input.roomType,
      totalAmount: input.totalAmount,
      currency: input.currency ?? "TRY",
      timeline: [
        { at: now, kind: "quote", label: "Teklif oluşturuldu" },
        ...(status === "pending_payment"
          ? [{ at: now, kind: "payment", label: "Ödeme bekleniyor" }]
          : []),
      ],
    })
    .returning();

  await database
    .update(conversations)
    .set({
      reservationState: status === "confirmed" ? "confirmed" : "quoted",
      paymentState: status === "pending_payment" ? "pending" : "none",
    })
    .where(eq(conversations.id, input.conversationId));

  return row;
}

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
  timelineLabel: string
) {
  const database = assertDb();
  const now = new Date().toISOString();

  const [existing] = await database
    .select()
    .from(reservations)
    .where(eq(reservations.id, reservationId))
    .limit(1);

  if (!existing) throw new Error("reservation_not_found");

  const timeline = [...(existing.timeline ?? []), { at: now, kind: status, label: timelineLabel }];

  const [row] = await database
    .update(reservations)
    .set({ status, timeline, updatedAt: new Date() })
    .returning();

  if (existing.conversationId) {
    const reservationState =
      status === "confirmed"
        ? "confirmed"
        : status === "cancelled"
          ? "cancelled"
          : status === "pending_payment"
            ? "payment_pending"
            : "quoted";
    const paymentState =
      status === "confirmed"
        ? "completed"
        : status === "pending_payment"
          ? "pending"
          : status === "cancelled"
            ? "none"
            : "none";

    await database
      .update(conversations)
      .set({ reservationState, paymentState })
      .where(eq(conversations.id, existing.conversationId));
  }

  return row;
}
