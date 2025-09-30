import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET() {
  try {
    const res = await api("/Account/Mail/SendOtp", {
      method: "GET",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
