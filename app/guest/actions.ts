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

    // success only when HTTP OK AND body says Success
    if (res.ok && data?.Success) {
      // Store tokens securely so session works across pages

      const base = { path: "/", sameSite: "lax" as const, secure: true };

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

export async function getUser() {
  const API = process.env.NEXT_PUBLIC_BASE_URL;
  if (!API) return { success: false, message: "API_BASE_URL is missing" };

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return { success: false, message: "No access token found" };
    }

    const res = await fetch(`${API}/Account/GetUser`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (res.ok && data) {
      return { success: true, user: data };
    }

    return {
      success: false,
      status: res.status,
      message: data?.Message || raw || "Failed to get user data",
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      message: err?.message || "Network error",
    };
  }
}
