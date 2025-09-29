/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const res = await api("/Auth/Login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.Success) {
      return NextResponse.json(
        {
          success: false,
          status: res.status,
          message: result?.Message || "Login failed",
        },
        { status: res.status }
      );
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

    return NextResponse.json({
      success: true,
      user: result.User ?? null,
      token: result.Token,
      refreshToken: result.RefreshToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 0,
        message: err?.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}
