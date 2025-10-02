/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
// IMPORTANT: ensure Node.js runtime so process.env is available
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const input = (searchParams.get("input") || "").trim();
    const sessiontoken = searchParams.get("sessiontoken") || "";
    const region = searchParams.get("region") || ""; // e.g. "bd"
    const language = searchParams.get("language") || "en";

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      // don’t log the key, just the fact it’s missing
      console.error("GOOGLE_MAPS_API_KEY is missing");
      return NextResponse.json(
        { status: "ERROR", error_message: "Server key missing" },
        { status: 500 }
      );
    }

    if (!input) {
      return NextResponse.json(
        { status: "ZERO_RESULTS", predictions: [] },
        { status: 200 }
      );
    }

    // Legacy Places Autocomplete REST endpoint (server-side use)
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    );
    url.searchParams.set("key", key);
    url.searchParams.set("input", input);
    // Better biasing: components=country:XX (region is mostly for geocoding)
    if (region) url.searchParams.set("components", `country:${region}`);
    if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);
    url.searchParams.set("language", language);
    // Optional: limit to establishments or geocode
    // url.searchParams.set("types", "establishment");

    const upstream = await fetch(url.toString(), { cache: "no-store" });

    const text = await upstream.text(); // read raw so we can show errors if JSON parse fails
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        status: "ERROR",
        error_message: text || "Non-JSON response from Google",
      };
    }

    // bubble up Google errors clearly to the client (but with 200 so the UI can read status)
    if (
      !upstream.ok ||
      data?.status === "REQUEST_DENIED" ||
      data?.status === "INVALID_REQUEST"
    ) {
      console.error("Places Autocomplete error:", {
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
    console.error("Autocomplete route fatal:", err);
    return NextResponse.json(
      { status: "ERROR", error_message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
