/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function socialLoginApple(payload: {
  Token: string; // Apple identity token (JWT from Apple)
  FirstName?: string;
  LastName?: string;
  GuestUserId?: string;
  IsWeb?: boolean;
  DeviceInfo?: any;
}) {
  try {
    const res = await api("/Auth/Social/Login", {
      method: "POST",
      body: JSON.stringify({
        Provider: "apple",
        Token: payload.Token,
        FirstName: payload.FirstName,
        LastName: payload.LastName,
        GuestUserId: payload.GuestUserId,
        IsWeb: payload.IsWeb ?? true,
        DeviceInfo: payload.DeviceInfo ?? null,
      }),
    });

    const data: any = await res.json().catch(() => null);

    if (!res.ok || !data?.Success) {
      return {
        success: false,
        status: res.status,
        message: data?.Message || "Apple login failed",
      };
    }

    // ✅ Save tokens into cookies
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

    return {
      success: true,
      user: data.User ?? null,
      token: data.Token,
      refreshToken: data.RefreshToken,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      message: err?.message || "Network error",
    };
  }
}
