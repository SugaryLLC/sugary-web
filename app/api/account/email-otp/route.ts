/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token" },
        { status: 401 }
      );
    }

    const res = await api("/Account/Mail/SendOtp", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.Success) {
      return NextResponse.json(
        { success: true, message: "OTP sent successfully", ...data },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: data?.Message || "Failed to send OTP" },
      { status: res.status }
    );
  } catch (error: any) {
    console.error("❌ Error sending OTP:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
