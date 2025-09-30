import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const otp = searchParams.get("otp");

  if (!otp) {
    return NextResponse.json({ error: "OTP is required" }, { status: 400 });
  }

  try {
    const res = await api(`/Account/Mail/Verify?otp=${otp}`, {
      method: "GET",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
