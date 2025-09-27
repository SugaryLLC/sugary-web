"use server";

import { createGuestUser } from "@/actions/auth/CreateGuest";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import { cookies } from "next/headers";

export async function ensureUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    const guest = await createGuestUser();
    return guest;
  }

  return await getCurrentUser();
}
