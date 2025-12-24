import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("sparkio_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${env.API_BASE_URL}/api/admin/submissions/review.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
