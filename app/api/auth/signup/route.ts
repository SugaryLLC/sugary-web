/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function signup(payload: {
  FirstName: string;
  LastName: string;
  Avatar?: string;
  Email: string;
  Password: string;
  GuestUserId: string;
}) {
  try {
    const res = await api("/Account/SignUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (res.ok && data?.Success) {
      // Save access + refresh token cookies if returned
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

      return { success: true, user: data };
    }

    return {
      success: false,
      status: res.status,
      message: data?.Message || "Signup failed",
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      message: err?.message || "Network error",
    };
  }
}
