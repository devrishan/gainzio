import { env } from "@/lib/env";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

export interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  token?: string | null;
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const { auth = true, token, headers, ...init } = options;

  const finalHeaders = new Headers({
    "Content-Type": "application/json",
    ...Object.fromEntries(headers ? new Headers(headers) : []),
  });

  if (auth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers: finalHeaders,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => ({
    success: false,
    error: "Unexpected API response.",
  }))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(json.error ?? "API request failed.");
  }

  return json;
}

export async function apiMutate<T = unknown>(
  path: string,
  body: unknown,
  method: HttpMethod = "POST",
  options: ApiRequestOptions = {},
) {
  return apiFetch<T>(path, {
    ...options,
    method,
    body: JSON.stringify(body),
  });
}

