import { api } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { Success: false, Message: "Email is required" },
        { status: 400 }
      );
    }

    // Call your backend API
    const res = await api(
      `/Account/SendPassResetLink?email=${encodeURIComponent(
        email
      )}&userType=customer`,
      {
        method: "GET",
      }
    );

    const data = await res.json();
    console.log(data, "Forgot password response");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { Success: false, Message: "Failed to send reset link" },
      { status: 500 }
    );
  }
}
