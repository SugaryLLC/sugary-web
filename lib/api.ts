// lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL !== ""
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BASE_URL
    : "http://localhost:3000";

export async function api(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  // default headers
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    accept: "application/json",
  };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}), // allow overrides
    },
    credentials: "include", // include cookies automatically
  });
}
