import { CartItem } from "@/types/cart";
import { OrderTotals, OrderWithItems, SerializedOrder } from "@/types/order";
import { randomUUID } from "crypto";
import { formatPrice, PRICING_CONFIG } from "./priceUtils";
// Types for cart validation
export interface CartValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Validate cart items structure and basic rules
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

/**
 * Format order ID for display
 */
export const formatOrderId = (id: string): string => {
  return `#${id.slice(-8).toUpperCase()}`;
};

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const uuid = randomUUID().slice(-8).toUpperCase();

  return `ORD-${year}${month}-${uuid}`;
}

/**
 * Serialize order data for client components
 * Converts Prisma Decimal fields to numbers
 */

export function serializeOrder(order: OrderWithItems): SerializedOrder {
  return {
    ...order,
    totalAmount: Number(order.totalAmount), // Convert Decimal to number
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: Number(item.price), // Convert Decimal to number
    })),
  };
}

// ==================== ORDER CALCULATION FUNCTIONS ====================

/**
 * Check if order contains only digital products
 */
export const isDigitalOrder = (items: CartItem[]): boolean => {
  return items.every((item) => item.isDigital);
};

/**
 * Calculate subtotal from cart items
 */
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

/**
 * Calculate shipping cost based on items and subtotal
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
 */
export const calculateTax = (subtotal: number): number => {
  return subtotal * PRICING_CONFIG.TAX_RATE;
};

/**
 * Calculate complete order totals
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

// ==================== ORDER DISPLAY FUNCTIONS ====================
