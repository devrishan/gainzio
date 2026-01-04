import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from '@/lib/api-auth';
import { Role } from "@prisma/client";
import { z } from "zod";

import { getMaintenanceState, setMaintenanceState, disableMaintenance } from "@/lib/maintenance";

const maintenanceSchema = z.object({
  enabled: z.boolean(),
  message: z.string().max(280).optional(),
  durationMinutes: z.number().int().positive().max(24 * 60).optional(),
});

// Since this is inside route.ts, we need to pass the request object
// But getAuthenticatedUser needs a NextRequest.
// The helper was calling cookies(), which works in server components/actions but in route handlers passing Request is better.
// However, ensureAdmin was called without args.
// We should just inline the check in GET/POST or pass request.
// Let's modify GET/POST to call getAuthenticatedUser directly.

async function checkAdmin(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  if (authUser.role !== Role.ADMIN) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await checkAdmin(request);
  if (authError) {
    return authError;
  }

  try {
    const state = await getMaintenanceState();

    return NextResponse.json({
      success: true,
      state,
    });
  } catch (error) {
    console.error("Failed to fetch maintenance state:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch maintenance state." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await checkAdmin(request);
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const payload = maintenanceSchema.parse(body);

    if (payload.enabled && !payload.durationMinutes) {
      return NextResponse.json(
        { success: false, error: "Duration (minutes) is required when enabling maintenance." },
        { status: 400 },
      );
    }

    const state = payload.enabled
      ? await setMaintenanceState({
        enabled: true,
        message: payload.message,
        durationMinutes: payload.durationMinutes,
      })
      : await disableMaintenance();

    return NextResponse.json({
      success: true,
      state,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input.", details: error.flatten() }, { status: 400 });
    }

    console.error("Failed to update maintenance state:", error);
    return NextResponse.json({ success: false, error: "Failed to update maintenance state." }, { status: 500 });
  }
}


