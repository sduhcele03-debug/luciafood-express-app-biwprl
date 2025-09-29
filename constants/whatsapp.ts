// Global WhatsApp Number Configuration for LuciaFood Express

/**
 * Food Order Checkout Number
 * Used for: Final WhatsApp checkout when customers place food orders
 */
export const FOOD_ORDER_CHECKOUT_NUMBER = '0822116064';

/**
 * Local Trades Booking & Advertising Number  
 * Used for: Verified Plumbers, Verified Electricians booking requests, and Advertising CTA
 */
export const LOCAL_TRADES_BOOKING_NUMBER = '0787549186';

/**
 * Advertising Number (same as local trades)
 * Used for: Business advertising inquiries
 */
export const ADVERTISING_NUMBER = '0787549186';

/**
 * Generate WhatsApp deep link URL
 * @param phoneNumber - Phone number without country code (e.g., '0822116064')
 * @param message - Message to pre-fill
 * @returns Complete WhatsApp URL
 */
export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/27${phoneNumber}?text=${encodedMessage}`;
};