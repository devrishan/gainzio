/**
 * Masks a phone number to show only the last 4 digits with a prefix.
 * Helper for DealBuddy UI.
 * Format: +91-*****3824
 */
export function maskPhoneNumber(phone: string): string {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    // Assume Indian numbers for the specific format requested
    // If it's a 10 digit number working backwards
    if (cleaned.length >= 4) {
        const last4 = cleaned.slice(-4);
        return `+91-*****${last4}`;
    }
    return phone;
}

/**
 * Masks a User ID.
 * Format: ***XZ12
 */
export function maskUserId(userId: string): string {
    if (!userId || userId.length < 4) return userId;
    const last4 = userId.slice(-4);
    return `***${last4}`;
}
