"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export function ReferralTracker() {
    const searchParams = useSearchParams();
    const { status } = useSession();
    const processedRef = useRef<boolean>(false);

    useEffect(() => {
        // 1. Capture Logic
        const refCode = searchParams?.get("ref");

        // Only process if refCode exists and hasn't been processed in this mount
        if (refCode && !processedRef.current && status !== "authenticated") {
            const days = 30;
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "; expires=" + date.toUTCString();

            document.cookie = "referral_code=" + refCode + expires + "; path=/; SameSite=Lax";
            localStorage.setItem("referral_code", refCode);

            processedRef.current = true;
        }

        // 2. Cleanup Logic (if logged in)
        if (status === "authenticated") {
            // Clear cookie
            document.cookie = "referral_code=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // Clear localStorage
            localStorage.removeItem("referral_code");
        }
    }, [searchParams, status]);

    return null;
}
