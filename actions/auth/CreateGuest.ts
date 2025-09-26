/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { cookies } from "next/headers";
export async function createGuest() {
  const API = process.env.NEXT_PUBLIC_BASE_URL;
  if (!API) return { success: false, message: "API_BASE_URL is missing" };

  try {
    const res = await fetch(`${API}/Account/guest`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // Safe parse (prevents "Unexpected end of JSON input")
    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      /* keep data=null */
    }

    if (res.ok && data?.Success) {
      // Store tokens securely so session works across pages

      const base = {
        path: "/",
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      };

      const cookieStore = await cookies();
      if (data.Token) {
        cookieStore.set("access_token", data.Token, {
          ...base,
          httpOnly: true,
          expires: data.AccessTokenExpiresAt
            ? new Date(data.AccessTokenExpiresAt)
            : undefined,
        });
      }
      if (data.RefreshToken) {
        cookieStore.set("refresh_token", data.RefreshToken, {
          ...base,
          httpOnly: true,
          expires: data.RefreshTokenExpiresAt
            ? new Date(data.RefreshTokenExpiresAt)
            : undefined,
        });
      }

      return { success: true, ...data };
    }

    return {
      success: false,
      status: res.status,
      message: data?.Message || raw || "Guest creation failed",
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      message: err?.message || "Network error",
    };
  }
}
