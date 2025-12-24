import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Masks phone number to show only last 3 digits
 * Example: 9876543210 -> *******210
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 3) return phone;
  const lastThree = phone.slice(-3);
  return "*".repeat(phone.length - 3) + lastThree;
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}
