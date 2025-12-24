import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.email) {
    return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
  }

  const email = body.email;

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "Invalid email address." }, { status: 400 });
  }

  // Check if PHP API has forgot password endpoint, otherwise return success (security: don't reveal if email exists)
  try {
    const response = await fetch(`${env.API_BASE_URL}/api/auth/forgot-password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Always return success to prevent email enumeration
    // The PHP API will handle the actual email sending
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you'll receive password reset instructions.",
    });
  } catch (error) {
    // If PHP endpoint doesn't exist yet, still return success for security
    // In production, you should implement the actual email sending
    console.error("Forgot password API error:", error);
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you'll receive password reset instructions.",
    });
  }
}

