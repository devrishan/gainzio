/**
 * Phone number validation and formatting utilities
 */

/**
 * Validate Indian phone number format
 */
export function validateIndianPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian phone numbers: 10 digits, optionally prefixed with 91
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned); // Must start with 6-9
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  
  if (cleaned.length === 13 && cleaned.startsWith('+91')) {
    return /^\+91[6-9]\d{9}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Format phone number for display (mask middle digits)
 * Shows first 2 and last 3 digits: +91 98***123
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}***${cleaned.slice(-3)}`;
  }
  
  if (cleaned.length >= 12 && cleaned.startsWith('91')) {
    const last10 = cleaned.slice(-10);
    return `+91 ${last10.slice(0, 2)}***${last10.slice(-3)}`;
  }
  
  return phone.replace(/(\d{2})\d+(\d{3})/, '$1***$2');
}

/**
 * Format phone number for display (show last 3 digits only for referrals)
 * Shows: ***123
 */
export function maskPhoneForReferral(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const last3 = cleaned.slice(-3);
  return `***${last3}`;
}

/**
 * Normalize phone number to standard format (digits only, with country code)
 * Returns: 919876543210 (for Indian numbers)
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  if (cleaned.startsWith('+91')) {
    return cleaned.slice(1);
  }
  
  return cleaned;
}

/**
 * Format phone number for E.164 format
 * Returns: +919876543210
 */
export function formatE164(phone: string): string {
  const normalized = normalizePhone(phone);
  return `+${normalized}`;
}

