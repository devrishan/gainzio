import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function PUT(request: NextRequest) {
  const token = cookies().get("sparkio_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  const response = await fetch(`${env.API_BASE_URL}/api/admin/referrals/update.php`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { success: false, error: result?.error ?? "Unable to update referral." },
      { status: response.status || 500 },
    );
  }

  return NextResponse.json(result);
}

