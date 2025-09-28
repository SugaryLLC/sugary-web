// lib/api.ts

// 👇 Use different base URLs depending on environment
const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL !== ""
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BASE_URL // fallback for prod if env is missing
    : "http://localhost:3000"; // fallback for dev

export async function api(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  if (typeof window !== "undefined") {
    // ✅ Runs in browser, check what your client is seeing
    console.log("🌍 Client Fetch URL:", url);
  } else {
    console.log("🖥️ Server Fetch URL:", url);
  }

  return fetch(url, {
    ...options,
    credentials: "include", // include cookies (auth)
  });
}
