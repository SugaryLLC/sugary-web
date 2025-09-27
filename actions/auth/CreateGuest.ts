"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function createGuestUser() {
  try {
    const res = await api("/Account/Guest", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (res.ok && data?.Success) {
      const cookieStore = await cookies();

      cookieStore.set("access_token", data.Token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(data.AccessTokenExpiresAt),
      });

      cookieStore.set("refresh_token", data.RefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(data.RefreshTokenExpiresAt),
      });

      return { success: true, user: data.User };
    }

    return {
      success: false,
      status: res.status,
      message: data?.Message || raw || "Failed to create guest user",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}
