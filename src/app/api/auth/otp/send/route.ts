import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/otp-provider";
import { z } from "zod";

const sendOtpSchema = z.object({
    phone: z.string().min(3), // Email or phone
    channel: z.enum(["sms", "email"]).optional().default("sms"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, channel } = sendOtpSchema.parse(body);

        const isEmail = phone.includes("@");
        const effectiveChannel = isEmail ? "email" : channel;

        await sendOtp({
            phone,
            channel: effectiveChannel,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
        });

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        console.error("[OTP Send Error]", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to send OTP" },
            { status: 400 }
        );
    }
}
