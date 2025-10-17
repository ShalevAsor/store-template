/**
 * Supported currencies with their configuration.
 *
 * IMPORTANT: Currency codes MUST be valid ISO 4217 codes.
 * When adding a new currency:
 * 1. Use the correct 3-letter ISO 4217 code (e.g., "USD", "EUR", "JPY")
 * 2. Set correct decimal places (0 for JPY, 2 for USD/EUR, 3 for KWD/BHD)
 * 3. Use the official currency symbol
 *
 * Reference: https://en.wikipedia.org/wiki/ISO_4217
 */
const SUPPORTED_CURRENCIES = {
  USD: { decimals: 2, symbol: "$", name: "US Dollar" },
  EUR: { decimals: 2, symbol: "€", name: "Euro" },
  ILS: { decimals: 2, symbol: "₪", name: "Israeli New Shekel" },
} as const;

type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Array of supported currency codes.
 * Automatically derived from SUPPORTED_CURRENCIES keys.
 * Used for Zod schema validation and currency selection dropdowns.
 */
export const SUPPORTED_CURRENCY_CODES = Object.keys(
  SUPPORTED_CURRENCIES
) as Array<SupportedCurrency>;

export interface LineItemPrice {
  unitPrice: string;
  lineTotal: string;
  formattedLine: string; // "X quantity × Y price"
}

/**
 * Get currency configuration for a given currency code
 */
function getCurrencyConfig(currency: string) {
  const upperCurrency = currency.toUpperCase() as SupportedCurrency;
  const config = SUPPORTED_CURRENCIES[upperCurrency];

  if (!config) {
    throw new Error(
      `Unsupported currency: ${currency}. Supported: USD, EUR, ILS`
    );
  }

  return config;
}

/**
 * Convert decimal amount to smallest currency unit (cents/agorot/eurocents)
 * Example: majorUnitToMinor(10.50, 'USD') = 1050 (cents)
 * Example: majorUnitToMinor(10.50, 'ILS') = 1050 (agorot)
 * Example: majorUnitToMinor(10.50, 'EUR') = 1050 (eurocents)
 */
export function majorUnitToMinor(
  amount: number,
  currency: string = "USD"
): number {
  const { decimals } = getCurrencyConfig(currency);
  return Math.round(amount * Math.pow(10, decimals));
}

/**
 * Convert smallest currency unit to decimal amount
 * Example: minorToMajorUnit(1050, 'USD') = 10.50 (dollars)
 * Example: minorToMajorUnit(1050, 'ILS') = 10.50 (shekels)
 * Example: minorToMajorUnit(1050, 'EUR') = 10.50 (euros)
 */
export function minorToMajorUnit(
  cents: number,
  currency: string = "USD"
): number {
  const { decimals } = getCurrencyConfig(currency);
  return cents / Math.pow(10, decimals);
}

/**
 * Format amount in minor units as a currency string
 * Example: formatCurrency(1050, 'USD') = "$10.50"
 * Example: formatCurrency(1050, 'ILS') = "₪10.50"
 */
export function formatCurrency(minorUnits: number, currency: string): string {
  const config = getCurrencyConfig(currency);
  const amount = minorToMajorUnit(minorUnits, currency);

  // Use Intl.NumberFormat for proper formatting
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return formatter.format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  return getCurrencyConfig(currency).symbol;
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(currency: string): boolean {
  return currency.toUpperCase() in SUPPORTED_CURRENCIES;
}

/**
 * Get list of supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(SUPPORTED_CURRENCIES);
}

/**
 * Safe addition of currency amounts
 */
export function addAmounts(...amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}

/**
 * Calculate percentage of an amount
 * Example: calculatePercentage(1000, 10) = 100 (10% of $10.00)
 */
export function calculatePercentage(
  minorUnits: number,
  percentage: number
): number {
  return Math.round((minorUnits * percentage) / 100);
}

/**
 * Format price
 */
export function formatPrice(
  minorUnits: number,
  currency: string = "USD"
): string {
  return formatCurrency(minorUnits, currency);
}

/**
 * Format line item price (price x quantity)
 */
export const formatLineItemPrice = (
  price: number,
  quantity: number
): LineItemPrice => {
  return {
    unitPrice: formatPrice(price),
    lineTotal: formatPrice(price * quantity),
    formattedLine: `${quantity} × ${formatPrice(price)}`,
  };
};
