import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/server-api";

export async function GET() {
  try {
    const cookieStore = cookies();
    // Check both new and legacy cookie names
    const accessToken = cookieStore.get("earniq_access_token")?.value || cookieStore.get("sparkio_token")?.value;

    if (!accessToken) {
      // Return 200 with unauthenticated status to avoid console errors
      // The client-side code will handle this gracefully
      return NextResponse.json({ success: false, user: null });
    }

    // Try to fetch user data from API, but don't fail the page if API is unavailable
    try {
      const data = await serverFetch<{ success: boolean; user: unknown }>("/api/auth/me.php");
      if (data && data.user) {
        return NextResponse.json({ success: true, user: data.user });
      }
    } catch (error) {
      // Silently fail - API might be unavailable, user will need to login again
      // Don't log errors in production to avoid noise
      if (process.env.NODE_ENV === "development") {
        console.warn("Session API call failed:", error instanceof Error ? error.message : "Unknown error");
      }
    }

    // If we get here, either no token or API call failed - return unauthenticated
    // Return 200 to avoid console errors for expected unauthenticated state
    return NextResponse.json({ success: false, user: null });
  } catch (error) {
    // Handle any unexpected errors gracefully - never throw
    if (process.env.NODE_ENV === "development") {
      console.error("Session route unexpected error:", error);
    }
    // Return 200 even on errors to prevent console noise
    return NextResponse.json({ success: false, user: null });
  }
}
