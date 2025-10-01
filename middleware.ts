import { NextResponse, NextRequest } from "next/server";
import { api } from "./lib/api";

const protectedRoutes = ["/dashboard", "/account", "/orders"]; // adjust as needed

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token");

  if (!accessToken) {
    // Create guest session for public pages
    if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
      const apiRes = await api("/Auth/Guest", {
        method: "POST",
      });

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

      return res;
    }

    // 🚨 Protected route but no auth → redirect to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  try {
    const userRes = await api("/Account/GetUser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    if (userRes.ok) {
      const user = await userRes.json();

      if (
        user?.IsGuest &&
        protectedRoutes.some((route) => pathname.startsWith(route))
      ) {
        const loginUrl = new URL("/", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  } catch (err) {
    console.error("❌ Error checking user in middleware:", err);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // all routes except static files
};
