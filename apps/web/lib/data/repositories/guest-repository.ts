import { getGuestById, getGuests } from "../guests";

/** Mock repository — swap bodies for Supabase/Drizzle callers without touching UI modules. */
export const guestRepository = {
  findAll: getGuests,
  findById: getGuestById,
};
