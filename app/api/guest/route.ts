import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function POST() {
  const res = await api("/Account/Guest", {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    cache: "no-store",
  });

  const data = await res.json();

  if (res.ok && data.Success) {
    const response = NextResponse.json({ success: true, user: data.User });

    response.cookies.set("access_token", data.Token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(data.AccessTokenExpiresAt),
    });

    response.cookies.set("refresh_token", data.RefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(data.RefreshTokenExpiresAt),
    });

    return response;
  }

  return NextResponse.json(
    { success: false, message: data?.Message || "Failed to create guest" },
    { status: 400 }
  );
}
