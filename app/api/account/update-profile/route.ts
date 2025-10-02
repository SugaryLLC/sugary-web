/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/account/update-profile/route.ts
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const cookieStore: any = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: no token" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = await req.json().catch(() => ({}));

    // Log the payload for debugging
    console.log("Received payload:", payload);

    const res = await api("Account/UpdateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // Handle 204 No Content response
    if (res.status === 204) {
      return NextResponse.json(
        { Success: true },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    let data: any = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { Message: text };
    }

    return NextResponse.json(data ?? {}, {
      status: res.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
