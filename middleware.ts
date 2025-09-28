import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const hasToken = req.cookies.get("access_token");
  if (!hasToken) {
    // create guest from backend API
    const apiRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/Auth/Guest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    const data = await apiRes.json();

    if (apiRes.ok && data.Success) {
      res.cookies.set("access_token", data.Token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(data.AccessTokenExpiresAt),
      });

      res.cookies.set("refresh_token", data.RefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(data.RefreshTokenExpiresAt),
      });
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // all routes except static files
};
