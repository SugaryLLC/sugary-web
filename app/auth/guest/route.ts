/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGuestUser } from "@/actions/auth/CreateGuest";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await createGuestUser();

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
