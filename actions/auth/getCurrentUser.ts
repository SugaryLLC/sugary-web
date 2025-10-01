"use server";
import { api } from "@/lib/api";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cookies } from "next/headers";

export async function getCurrentUser() {
  const API = process.env.NEXT_PUBLIC_BASE_URL;
  if (!API) return { success: false, message: "API_BASE_URL is missing" };

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return { success: false, message: "No access token found" };
    }

    const res = await api("/Account/GetUser", {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "force-cache",
      next: {
        revalidate: 3600, // Revalidate data every hour
        tags: ["current-user"], // Tag for manual revalidation
      },
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (res.ok && data) {
      return { success: true, user: data };
    }

    return {
      success: false,
      status: res.status,
      message: data?.Message || "Failed to get user data",
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      message: err?.message || "Network error",
    };
  }
}
