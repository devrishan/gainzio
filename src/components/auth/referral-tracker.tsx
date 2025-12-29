"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
    const searchParams = useSearchParams();
    const processedRef = useRef<boolean>(false);

    useEffect(() => {
        const refCode = searchParams?.get("ref");

        // Only process if refCode exists and hasn't been processed in this mount (optional safety)
        if (refCode) {
            // 1. Check if we already have a stored referral (don't overwrite unless we want to support that)
            // The requirement says: "Ignore referral data on all future logins" & "Lock referral permanently after signup"
            // But typically we track the *latest* click before signup, or the *first* click?
            // Requirement: "Referral records created only for new users", "Lock referral permanently after signup".
            // This implies we should catch it now. If they already signed up, the backend ignores it.
            // If they haven't signed up, we should store it.
            // Strategy: Store in cookie. Backend decides usage.

            // Store in cookie for 30 days
            // using document.cookie for client-side
            const days = 30;
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "; expires=" + date.toUTCString();

            document.cookie = "referral_code=" + refCode + expires + "; path=/; SameSite=Lax";

            // Also store in localStorage for backup/persistence across session clear if needed (optional)
            localStorage.setItem("referral_code", refCode);

            // Prevent re-running unnecessary logic
            processedRef.current = true;
        }
    }, [searchParams]);

    return null;
}
