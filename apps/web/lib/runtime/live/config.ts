/** Client-safe pilot hotel id (public env for realtime subscriptions). */
export function resolvePilotHotelIdClient(): string | null {
  const id = process.env.NEXT_PUBLIC_PILOT_HOTEL_ID?.trim();
  return id || null;
}

export function isLiveOpsClientEnabled(): boolean {
  return Boolean(resolvePilotHotelIdClient());
}
