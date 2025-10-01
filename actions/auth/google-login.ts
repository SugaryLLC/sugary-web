/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function socialLoginGoogle(payload: {
  Provider?: string;
  Token: string; // Can be either ID token or access token
  GuestUserId?: string;
  FirstName?: string;
  LastName?: string;
}) {
  try {
    const res = await api("/Auth/Social/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        Provider: "google",
        Token: payload.Token,
        IsWeb: true,
        FirstName: payload.FirstName,
        LastName: payload.LastName,
        GuestUserId: payload.GuestUserId,
        DeviceInfo: null,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.Success) {
      console.error("Social login failed:", {
        status: res.status,
        data: data,
      });
      return {
        success: false,
        message: data?.Message || `Google login failed (${res.status})`,
      };
    }

    // ✅ Save tokens in cookies
    const cookieStore = await cookies();
    const base = {
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };

    if (data.Token) {
      cookieStore.set("access_token", data.Token, {
        ...base,
        httpOnly: true,
        expires: data.AccessTokenExpiresAt
          ? new Date(data.AccessTokenExpiresAt)
          : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours fallback
      });
    }
    if (data.RefreshToken) {
      cookieStore.set("refresh_token", data.RefreshToken, {
        ...base,
        httpOnly: true,
        expires: data.RefreshTokenExpiresAt
          ? new Date(data.RefreshTokenExpiresAt)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days fallback
      });
    }

    return {
      success: true,
      user: data.User,
      token: data.Token,
      message: "Login successful",
    };
  } catch (err: any) {
    console.error("Social login error:", err);
    return {
      success: false,
      message: err.message || "Network error occurred",
    };
  }
}
