/** Resolves the active pilot hotel for live operations (single-tenant pilot). */
export function resolvePilotHotelId(): string | null {
  const id = process.env.PILOT_HOTEL_ID?.trim();
  return id || null;
}

export function requirePilotHotelId(): string {
  const id = resolvePilotHotelId();
  if (!id) {
    throw new Error("pilot_hotel_not_configured");
  }
  return id;
}

export function isLiveOpsEnabled(): boolean {
  return Boolean(resolvePilotHotelId() && process.env.DATABASE_URL?.trim());
}
