/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const res = await api("/Auth/SignUp", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data: any = await res.json().catch(() => null);

    if (!res.ok || !data?.Success) {
      return NextResponse.json(
        {
          success: false,
          status: res.status,
          message: data?.Message || "Signup failed",
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

    return NextResponse.json({
      success: true,
      user: data.User ?? null,
      token: data.Token,
      refreshToken: data.RefreshToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, status: 0, message: err?.message || "Network error" },
      { status: 500 }
    );
  }
}
