import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-provider";
import { z } from "zod";

const verifyOtpSchema = z.object({
    phone: z.string().min(3),
    code: z.string().length(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, code } = verifyOtpSchema.parse(body);

        const isValid = await verifyOtp({ phone, code });

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired OTP" },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, message: "OTP verified" });
    } catch (error: any) {
        console.error("[OTP Verify Error]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to verify OTP" },
            { status: 400 }
        );
    }
}
