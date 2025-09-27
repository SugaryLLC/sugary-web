"use server";

import { createGuestUser } from "@/actions/auth/CreateGuest";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import { cookies } from "next/headers";

export async function ensureUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // If no token, create a guest
  if (!token) {
    const guest = await createGuestUser();
    if (guest.success) {
      return { success: true, user: guest.user || guest };
    }
    return guest;
  }

  // Otherwise, fetch the current user
  return await getCurrentUser();
}
