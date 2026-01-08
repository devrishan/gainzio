import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { email, dob, state, district } = body;

        // Basic Validation
        if (!dob || !state || !district) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Age Calculation & Validation (Min 10 years)
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 10) {
            return new NextResponse("You must be at least 10 years old.", { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                email,
                dob: birthDate,
                state,
                district,
                country: "India", // Defaulting to India for now as per IndianStates logic
                isProfileComplete: true
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error("[PROFILE_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
