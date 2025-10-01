import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const otp = searchParams.get("otp");

  if (!otp) {
    return NextResponse.json({ error: "OTP is required" }, { status: 400 });
  }

  try {
    // Get access token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: no token" },
        { status: 401 }
      );
    }

    // Call backend with Authorization header
    const res = await api(`/Account/Mail/Verify?otp=${otp}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.Message || "Failed to verify OTP" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, ...data }, { status: 200 });
  } catch (error) {
    console.error("❌ Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
