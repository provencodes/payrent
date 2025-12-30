/**
 * Currency utility functions for consistent Naira/Kobo conversion
 *
 * Business Logic:
 * - Users see and input amounts in Naira (₦)
 * - Paystack API expects amounts in Kobo (1 Naira = 100 Kobo)
 * - Database stores amounts in Naira for payments and Kobo for wallets
 * - All conversions use proper rounding to avoid floating point issues
 */

export class CurrencyUtil {
  /**
   * Convert Naira to Kobo for Paystack API
   * @param naira Amount in Naira
   * @returns Amount in Kobo (integer)
   */
  static nairaToKobo(naira: number): number {
    if (!naira || naira < 0) {
      throw new Error('Invalid Naira amount');
    }
    return Math.round(Number(naira) * 100);
  }

  /**
   * Convert Kobo to Naira from Paystack API
   * @param kobo Amount in Kobo
   * @returns Amount in Naira (decimal)
   */
  static koboToNaira(kobo: number): number {
    if (!kobo || kobo < 0) {
      throw new Error('Invalid Kobo amount');
    }
    return Number(kobo) / 100;
  }

  /**
   * Format amount for display to users
   * @param naira Amount in Naira
   * @returns Formatted string with currency symbol
   */
  static formatNaira(naira: number): string {
    return `₦${Number(naira).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Validate amount is positive and not zero
   * @param amount Amount to validate
   * @param fieldName Name of the field for error message
   */
  static validateAmount(amount: number, fieldName = 'Amount'): void {
    if (!amount || amount <= 0) {
      throw new Error(`${fieldName} must be greater than zero`);
    }
    if (isNaN(amount)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
  }

  /**
   * Round amount to 2 decimal places for Naira
   * @param amount Amount to round
   * @returns Rounded amount
   */
  static roundNaira(amount: number): number {
    return Math.round(Number(amount) * 100) / 100;
  }
}
