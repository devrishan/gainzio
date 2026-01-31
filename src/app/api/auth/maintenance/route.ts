import { NextResponse } from "next/server";

import { getMaintenanceState } from "@/lib/maintenance";

export async function GET() {
  try {
    const state = await getMaintenanceState();

    return NextResponse.json({
      success: true,
      maintenance: state.enabled,
      message: state.message ?? null,
      scheduledEnd: state.scheduledEnd ?? null,
    });
  } catch (error) {
    console.error("Failed to load maintenance status:", error);
    return NextResponse.json(
      {
        success: false,
        maintenance: false,
        error: "Unable to determine maintenance status.",
      },
      { status: 500 },
    );
  }
}


