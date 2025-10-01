import { api } from "@/lib/api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function socialLoginGoogle(payload: {
  Provider: string;
  Token: string;
  GuestUserId?: string;
  FirstName?: string;
  LastName?: string;
  Avatar?: string;
}) {
  try {
    const res = await api("/Auth/Social/Login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.Success) {
      return { success: false, message: data?.Message || "Login failed" };
    }

    // ✅ store cookies here (same as you did)
    return { success: true, user: data.User, token: data.Token };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error" };
  }
}
