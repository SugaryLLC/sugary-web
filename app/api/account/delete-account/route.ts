import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { cookies } from "next/headers";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const reason = searchParams.get("reason");

    if (!category || !reason) {
      return NextResponse.json(
        { Success: false, Message: "Category and reason are required" },
        { status: 400 }
      );
    }

    // ✅ Read access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { Success: false, Message: "Unauthorized: No token found" },
        { status: 401 }
      );
    }

    // ✅ Call backend with Authorization header
    const res = await api(
      `/Account/Delete?category=${encodeURIComponent(
        category
      )}&reason=${encodeURIComponent(reason)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ Account delete error:", error);
    return NextResponse.json(
      { Success: false, Message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
