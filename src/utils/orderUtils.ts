// import { CartItem } from "@/types/cart";
// import { getProductsForValidation } from "@/lib/products";
// import { ProductStatus } from "@/types/product";
// // Types for stock validation results
// export interface StockValidationResult {
//   success: boolean;
//   message?: string;
//   itemErrors?: Array<{
//     productId: string;
//     productName: string;
//     error: string;
//     availableStock: number | null;
//     requestedQuantity: number;
//   }>;
// }

// // Types for cart validation
// export interface CartValidationResult {
//   success: boolean;
//   error?: string;
// }

// // Helper function to check if order is digital
// export const isDigitalOrder = (items: CartItem[]): boolean => {
//   return items.every((item) => item.isDigital);
// };

// export const formatOrderId = (id: string) => {
//   return `#${id.slice(-8).toUpperCase()}`;
// };

// export const formatOrderDate = (date: Date) => {
//   return date.toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// export const formatOrderPrice = (price: number) => {
//   return null;
// };

// /**
//  * Validate cart items structure and basic rules
//  */
// export function validateCartItems(cartItems: CartItem[]): CartValidationResult {
//   if (!cartItems || cartItems.length === 0) {
//     return { success: false, error: "Cart is empty" };
//   }

//   for (const item of cartItems) {
//     if (!item.id || !item.name || item.price <= 0 || item.quantity <= 0) {
//       return { success: false, error: "Invalid item in cart" };
//     }
//   }

//   return { success: true };
// }

// /**
//  * Validate cart items against current stock levels
//  */
// export async function validateCartStock(
//   cartItems: CartItem[]
// ): Promise<StockValidationResult> {
//   try {
//     // Get current product data for stock validation
//     const productIds = cartItems.map((item) => item.id);
//     const products = await getProductsForValidation(productIds);

//     // Create a map for quick lookup
//     const productMap = new Map(products.map((p) => [p.id, p]));

//     const stockErrors: StockValidationResult["itemErrors"] = [];

//     // Validate each cart item against current product data
//     for (const cartItem of cartItems) {
//       const product = productMap.get(cartItem.id);

//       // Product not found or not active
//       if (!product || product.status !== ProductStatus.ACTIVE) {
//         stockErrors.push({
//           productId: cartItem.id,
//           productName: cartItem.name,
//           error: "Product is no longer available",
//           availableStock: 0,
//           requestedQuantity: cartItem.quantity,
//         });
//         continue;
//       }

//       // Skip validation for digital products (unlimited stock)
//       if (product.isDigital) {
//         continue;
//       }

//       // Check stock availability for physical products
//       if (product.stock !== null && cartItem.quantity > product.stock) {
//         const availableStock = Math.max(0, product.stock);
//         stockErrors.push({
//           productId: cartItem.id,
//           productName: cartItem.name,
//           error:
//             availableStock === 0
//               ? "Out of stock"
//               : `Only ${availableStock} available (requested ${cartItem.quantity})`,
//           availableStock: product.stock,
//           requestedQuantity: cartItem.quantity,
//         });
//       }
//     }

//     // Return validation result
//     if (stockErrors.length > 0) {
//       const errorMessage =
//         stockErrors.length === 1
//           ? `${stockErrors[0].productName}: ${stockErrors[0].error}`
//           : `${stockErrors.length} items have stock issues`;

//       return {
//         success: false,
//         message: errorMessage,
//         itemErrors: stockErrors,
//       };
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Error validating cart stock:", error);
//     return {
//       success: false,
//       message: "Unable to validate stock availability. Please try again.",
//     };
//   }
// }

// /**
//  * Calculate order totals
//  */
// export function calculateOrderTotals(cartItems: CartItem[]) {
//   const subtotal = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//   const orderIsDigital = isDigitalOrder(cartItems);
//   const shipping = orderIsDigital ? 0 : subtotal > 50 ? 0 : 10;
//   const tax = subtotal * 0.08; // 8% tax
//   const total = subtotal + shipping + tax;

//   return {
//     subtotal,
//     shipping,
//     tax,
//     total,
//     isDigital: orderIsDigital,
//   };
// }

// /**
//  * Format stock error message for user display
//  */
// export function formatStockErrorMessage(
//   stockResult: StockValidationResult
// ): string {
//   if (stockResult.success || !stockResult.itemErrors) {
//     return "";
//   }

//   if (stockResult.itemErrors.length === 1) {
//     const error = stockResult.itemErrors[0];
//     return `${error.productName}: ${error.error}`;
//   }

//   // Multiple errors - provide summary
//   const outOfStock = stockResult.itemErrors.filter(
//     (e) => e.availableStock === 0
//   );
//   const insufficientStock = stockResult.itemErrors.filter(
//     (e) => e.availableStock !== null && e.availableStock > 0
//   );

//   let message = "";
//   if (outOfStock.length > 0) {
//     message += `${outOfStock.length} item(s) out of stock`;
//   }
//   if (insufficientStock.length > 0) {
//     if (message) message += ", ";
//     message += `${insufficientStock.length} item(s) have insufficient stock`;
//   }

//   return message;
// }
import { CartItem } from "@/types/cart";
import { getProductsForValidation } from "@/lib/products";
import { ProductStatus } from "@/types/product";
// Import price functions from centralized location
import {
  isDigitalOrder,
  calculateOrderTotals,
  formatOrderId,
  formatOrderDate,
} from "@/utils/priceUtils";

// Re-export commonly used functions for convenience
export { isDigitalOrder, calculateOrderTotals, formatOrderId, formatOrderDate };

// Types for stock validation results
export interface StockValidationResult {
  success: boolean;
  message?: string;
  itemErrors?: Array<{
    productId: string;
    productName: string;
    error: string;
    availableStock: number | null;
    requestedQuantity: number;
  }>;
}

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
 * Validate cart items against current stock levels
 */
export async function validateCartStock(
  cartItems: CartItem[]
): Promise<StockValidationResult> {
  try {
    // Get current product data for stock validation
    const productIds = cartItems.map((item) => item.id);
    const products = await getProductsForValidation(productIds);

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    const stockErrors: StockValidationResult["itemErrors"] = [];

    // Validate each cart item against current product data
    for (const cartItem of cartItems) {
      const product = productMap.get(cartItem.id);

      // Product not found or not active
      if (!product || product.status !== ProductStatus.ACTIVE) {
        stockErrors.push({
          productId: cartItem.id,
          productName: cartItem.name,
          error: "Product is no longer available",
          availableStock: 0,
          requestedQuantity: cartItem.quantity,
        });
        continue;
      }

      // Skip validation for digital products (unlimited stock)
      if (product.isDigital) {
        continue;
      }

      // Check stock availability for physical products
      if (product.stock !== null && cartItem.quantity > product.stock) {
        const availableStock = Math.max(0, product.stock);
        stockErrors.push({
          productId: cartItem.id,
          productName: cartItem.name,
          error:
            availableStock === 0
              ? "Out of stock"
              : `Only ${availableStock} available (requested ${cartItem.quantity})`,
          availableStock: product.stock,
          requestedQuantity: cartItem.quantity,
        });
      }
    }

    // Return validation result
    if (stockErrors.length > 0) {
      const errorMessage =
        stockErrors.length === 1
          ? `${stockErrors[0].productName}: ${stockErrors[0].error}`
          : `${stockErrors.length} items have stock issues`;

      return {
        success: false,
        message: errorMessage,
        itemErrors: stockErrors,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error validating cart stock:", error);
    return {
      success: false,
      message: "Unable to validate stock availability. Please try again.",
    };
  }
}

/**
 * Format stock error message for user display
 */
export function formatStockErrorMessage(
  stockResult: StockValidationResult
): string {
  if (stockResult.success || !stockResult.itemErrors) {
    return "";
  }

  if (stockResult.itemErrors.length === 1) {
    const error = stockResult.itemErrors[0];
    return `${error.productName}: ${error.error}`;
  }

  // Multiple errors - provide summary
  const outOfStock = stockResult.itemErrors.filter(
    (e) => e.availableStock === 0
  );
  const insufficientStock = stockResult.itemErrors.filter(
    (e) => e.availableStock !== null && e.availableStock > 0
  );

  let message = "";
  if (outOfStock.length > 0) {
    message += `${outOfStock.length} item(s) out of stock`;
  }
  if (insufficientStock.length > 0) {
    if (message) message += ", ";
    message += `${insufficientStock.length} item(s) have insufficient stock`;
  }

  return message;
}
