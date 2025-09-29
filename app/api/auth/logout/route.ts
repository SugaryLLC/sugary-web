/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const res = await api("/Auth/Logout", { method: "GET" }).catch(() => null);
    const data = await res?.json().catch(() => null);

    // Clear cookies no matter what
    const cookieStore = await cookies();
    cookieStore.set("access_token", "", { path: "/", expires: new Date(0) });
    cookieStore.set("refresh_token", "", { path: "/", expires: new Date(0) });

    if (res?.ok && data?.Success) {
      return NextResponse.json({ success: true, message: "Logged out" });
    }

    // even if backend fails, treat logout as successful
    return NextResponse.json({ success: true, message: "Logged out locally" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: true, message: "Logged out (local)" });
  }
}
