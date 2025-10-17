import { CartItem } from "@/types/cart";
import { OrderTotals, OrderWithItems } from "@/types/order";
import { randomUUID } from "crypto";
import { formatPrice } from "@/utils/currencyUtils";

// Temporary pricing config - values in CENTS
// TODO: Move to admin settings / database
export const PRICING_CONFIG = {
  TAX_RATE: 0.17, // 17% VAT for Israel (you can change to 0.08 if you prefer)
  FREE_SHIPPING_THRESHOLD: 10000, // 100.00 USD in cents (was 50)
  STANDARD_SHIPPING_COST: 2500, // 25.00 USD in cents (was 10)
} as const;

// Types for cart validation
export interface CartValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Validate cart items structure and basic rules
 * Used in create order server action
 */
export function validateCartItems(cartItems: CartItem[]): CartValidationResult {
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  for (const item of cartItems) {
    if (!item.id || !item.name || item.price <= 0 || item.quantity <= 0) {
      return { success: false, error: "Invalid item in cart" };
    }
  }

  return { success: true };
}

// ==================== ORDER CALCULATION FUNCTIONS ====================

/**
 * Check if order contains only digital products
 */
export const isDigitalOrder = (items: CartItem[]): boolean => {
  return items.every((item) => item.isDigital);
};

/**
 * Calculate subtotal from cart items (prices already in minor units)
 */
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Calculate shipping cost based on items and subtotal
 * @param items - Cart items
 * @param subtotal - Subtotal in cents
 * @returns Shipping cost in cents
 */
export const calculateShipping = (
  items: CartItem[],
  subtotal: number
): number => {
  // No shipping for digital-only orders
  if (isDigitalOrder(items)) {
    return 0;
  }

  // Free shipping over threshold
  if (subtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return PRICING_CONFIG.STANDARD_SHIPPING_COST;
};

/**
 * Calculate tax based on subtotal
 * @param subtotal - Subtotal in cents
 * @returns Tax amount in cents
 */
export const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * PRICING_CONFIG.TAX_RATE);
};

/**
 * Calculate complete order totals
 * All amounts are in cents
 */
export const calculateOrderTotals = (items: CartItem[]): OrderTotals => {
  const subtotal = calculateSubtotal(items);
  const shipping = calculateShipping(items, subtotal);
  const tax = calculateTax(subtotal);
  const total = subtotal + shipping + tax;
  const isDigital = isDigitalOrder(items);

  return {
    subtotal,
    shipping,
    tax,
    total,
    isDigital,
    // Formatted versions for display
    formatted: {
      subtotal: formatPrice(subtotal),
      shipping: formatPrice(shipping),
      tax: formatPrice(tax),
      total: formatPrice(total),
    },
    // Helper properties
    qualifiesForFreeShipping:
      subtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping: Math.max(
      0,
      PRICING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal
    ),
  };
};

/**
 * Generate human readable order number
 * @returns
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const uuid = randomUUID().slice(-8).toUpperCase();

  return `ORD-${year}${month}-${uuid}`;
}
/**
 * return total amount (price) of an order
 * @returns
 */

export const getTotalAmount = (
  subtotal: number,
  shipping: number | null = 0,
  tax: number | null = 0
) => {
  return subtotal + (shipping ?? 0) + (tax ?? 0);
};

// ==================== ORDER COMMON TEXT MESSAGES ====================

export interface ShippingDisplay {
  text: string;
  className: string;
}

/**
 * Get shipping display text with appropriate styling
 */
export const getShippingCostDisplayText = (
  isDigital: boolean,
  shippingCost: number,
  formattedShippingCost: string
): ShippingDisplay => {
  if (isDigital) {
    return {
      text: "Digital - No shipping",
      className: "text-blue-600",
    };
  }
  if (shippingCost === 0) {
    return {
      text: "Free",
      className: "text-green-600",
    };
  }

  return {
    text: formattedShippingCost,
    className: "text-gray-900",
  };
};

/**
 * Get free shipping message for cart
 */
export const getFreeShippingMessage = (
  amountNeededForFreeShipping: number
): string => {
  return `Add ${formatPrice(
    amountNeededForFreeShipping
  )} more for free shipping`;
};

export const getShippingAddress = (order: OrderWithItems) => {
  if (!order.shippingLine1) return "N/A";

  const addressParts = [order.shippingLine1];
  if (order.shippingLine2) addressParts.push(order.shippingLine2);

  const locationParts = [
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ].filter(Boolean);

  return `${addressParts.join(", ")} • ${locationParts.join(", ")}`;
};

export const getItemsDisplay = (order: OrderWithItems) => {
  const itemCount = order.orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const uniqueProducts = order.orderItems.length;

  if (uniqueProducts === 1) {
    return `${itemCount} item${itemCount > 1 ? "s" : ""}`;
  }

  return `${itemCount} items (${uniqueProducts} products)`;
};
