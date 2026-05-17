export type OperationalEventType =
  | "PAYMENT_FAILED"
  | "RECOVERY_STARTED"
  | "RECOVERY_SUCCESS"
  | "BOOKING_CONFIRMED"
  | "UPSELL_ACCEPTED"
  | "VIP_ESCALATION"
  | "OTA_CONVERSION"
  | "HUMAN_TAKEOVER";

export type OperationalEventContext = {
  amountEur?: number;
  guestLabel?: string;
  guestId?: string;
  reservationId?: string;
  conversationId?: string;
  roomLabel?: string;
};

export type OperationalEvent = {
  type: OperationalEventType;
  context: OperationalEventContext;
};
