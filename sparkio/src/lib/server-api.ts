import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

interface ServerFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function serverFetch<T = unknown>(
  path: string,
  { auth = true, headers, ...init }: ServerFetchOptions = {},
): Promise<T> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("earniq_access_token")?.value;
  const legacyToken = cookieStore.get("sparkio_token")?.value;
  const token = accessToken || legacyToken;

  const isNextApiRoute = path.startsWith("/api/") && !path.includes(".php");
  const baseUrl = isNextApiRoute ? "" : env.API_BASE_URL;

  const requestHeaders = new Headers({
    "Content-Type": "application/json",
    ...Object.fromEntries(headers ? new Headers(headers) : []),
  });

  if (auth) {
    if (isNextApiRoute) {
      const cookieHeader = cookieStore
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join("; ");
      if (cookieHeader) {
        requestHeaders.set("Cookie", cookieHeader);
      }
    } else if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: requestHeaders,
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text().catch(() => "API request failed");
      throw new Error(error || "API request failed");
    }

    return (await response.json()) as T;
  } catch (error) {
    // Handle abort/timeout errors
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new Error("API request timed out. The server may be unreachable.");
    }
    // Handle network errors gracefully
    if (error instanceof TypeError || (error instanceof Error && error.message.includes("fetch"))) {
      throw new Error("API server is not available. Please ensure the PHP API server is running.");
    }
    throw error;
  }
}

export function clearAuthCookies() {
  const response = NextResponse.json({ success: true });

  // Clear new cookie names
  response.cookies.set({
    name: "earniq_access_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: "earniq_refresh_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: "earniq_user",
    value: "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear legacy cookies for backward compatibility
  response.cookies.set({
    name: "sparkio_token",
    value: "",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set({
    name: "sparkio_user",
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}

