/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function login(data: {
  UserName: string;
  Password: string;
  GuestUserId?: string;
}) {
  try {
    const res = await api("/Auth/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.Success) {
      console.error("❌ Login failed:", result);
      return {
        success: false,
        status: res.status,
        message: result?.Message || "Login failed",
      };
    }

    // ✅ Save tokens in cookies
    const cookieStore = await cookies();
    const base = {
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };

    if (result.Token) {
      cookieStore.set("access_token", result.Token, {
        ...base,
        httpOnly: true,
        expires: result.AccessTokenExpiresAt
          ? new Date(result.AccessTokenExpiresAt)
          : undefined,
      });
    }

    if (result.RefreshToken) {
      cookieStore.set("refresh_token", result.RefreshToken, {
        ...base,
        httpOnly: true,
        expires: result.RefreshTokenExpiresAt
          ? new Date(result.RefreshTokenExpiresAt)
          : undefined,
      });
    }

    // ✅ Debug logs
    console.log("✅ Login success:", {
      token: result.Token,
      refresh: result.RefreshToken,
      user: result.User,
    });

    return {
      success: true,
      user: result.User ?? null,
      token: result.Token,
      refreshToken: result.RefreshToken,
    };
  } catch (error: any) {
    console.error("🚨 Unexpected login error:", error);
    return {
      success: false,
      status: 0,
      message: error.message || "Unexpected error",
    };
  }
}
