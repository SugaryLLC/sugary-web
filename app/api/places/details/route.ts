/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const place_id = searchParams.get("place_id");
    const sessiontoken = searchParams.get("sessiontoken") || "";
    const language = searchParams.get("language") || "en";

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error("GOOGLE_MAPS_API_KEY is missing");
      return NextResponse.json(
        { status: "ERROR", error_message: "Server key missing" },
        { status: 500 }
      );
    }
    if (!place_id) {
      return NextResponse.json(
        { status: "INVALID_REQUEST", error_message: "place_id required" },
        { status: 200 }
      );
    }

    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json"
    );
    url.searchParams.set("key", key);
    url.searchParams.set("place_id", place_id);
    url.searchParams.set("language", language);
    url.searchParams.set("fields", "name,geometry,formatted_address");
    if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

    const upstream = await fetch(url.toString(), { cache: "no-store" });
    const text = await upstream.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        status: "ERROR",
        error_message: text || "Non-JSON response from Google",
      };
    }

    if (!upstream.ok || data?.status !== "OK") {
      console.error("Places Details error:", {
        httpStatus: upstream.status,
        googleStatus: data?.status,
        error_message: data?.error_message,
      });
      return NextResponse.json(
        {
          status: data?.status || "ERROR",
          error_message:
            data?.error_message ||
            `Google returned ${upstream.status}. Check API key restrictions & API enablement.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Details route fatal:", err);
    return NextResponse.json(
      { status: "ERROR", error_message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
