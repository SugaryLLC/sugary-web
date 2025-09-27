export async function api(path: string, options: RequestInit = {}) {
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL;
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
}
