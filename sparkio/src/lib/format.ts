/**
 * Masks a phone number for privacy
 * Example: "9876543210" -> "98****3210"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  
  const visible = 2; // Show first 2 and last 4 digits
  const lastVisible = 4;
  const start = phone.slice(0, visible);
  const end = phone.slice(-lastVisible);
  const masked = "*".repeat(phone.length - visible - lastVisible);
  
  return `${start}${masked}${end}`;
}

/**
 * Formats a phone number with masked digits and optional name
 * Example: maskPhoneWithName("Rahul Kumar", "9876543210") -> "Rahul 98****3210"
 */
export function maskPhoneWithName(name: string, phone: string): string {
  const firstName = name.split(" ")[0];
  const maskedPhone = maskPhoneNumber(phone);
  return `${firstName} ${maskedPhone}`;
}

/**
 * Masks UPI ID for privacy
 * Example: "user@paytm" -> "us****@paytm"
 */
export function maskUpiId(upiId: string): string {
  if (!upiId || !upiId.includes("@")) return upiId;
  
  const [username, domain] = upiId.split("@");
  if (username.length <= 4) return upiId;
  
  const visible = 2;
  const start = username.slice(0, visible);
  const masked = "*".repeat(username.length - visible);
  
  return `${start}${masked}@${domain}`;
}

/**
 * Formats currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
