/**
 * The number of decimal places used by every monetary amount of the platform.
 */
export const CURRENCY_DECIMAL_PLACES = 2;

/**
 * Rounds an amount to the currency precision, avoiding floating point errors
 * such as 19.99 * 3 = 59.970000000000006.
 * @param amount - Raw amount to round.
 * @returns The amount rounded to {@link CURRENCY_DECIMAL_PLACES} decimals.
 */
export function roundToCurrency(amount: number): number {
  const factor = Math.pow(10, CURRENCY_DECIMAL_PLACES);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}
