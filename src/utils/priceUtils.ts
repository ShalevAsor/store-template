// import { CartItem } from "@/types/cart";
// import { isDigitalOrder } from "./orderUtils";

// // Constants for pricing calculations
// export const PRICING_CONFIG = {
//   TAX_RATE: 0.08, // 8%
//   FREE_SHIPPING_THRESHOLD: 50,
//   STANDARD_SHIPPING_COST: 10,
// } as const;

// export interface PriceFormat {
//   currentPrice: string;
//   originalPrice?: string;
//   savings?: string;
//   hasDiscount: boolean;
// }

// export interface LineItemPrice {
//   unitPrice: string;
//   lineTotal: string;
//   formattedLine: string; // "X quantity × Y price"
// }

// export interface ShippingDisplay {
//   text: string;
//   className: string;
// }

// // ==================== CORE FORMATTING FUNCTIONS ====================

// /**
//  * Format price with currency symbol and consistent decimal places
//  */
// export const formatPrice = (price: number): string => {
//   return `$${price.toFixed(2)}`;
// };

// /**
//  * Format price range for products with discounts
//  */
// export const formatPriceWithDiscount = (
//   price: number,
//   compareAtPrice?: number | null
// ): PriceFormat => {
//   const hasDiscount =
//     compareAtPrice !== null &&
//     compareAtPrice !== undefined &&
//     compareAtPrice > price;

//   return {
//     currentPrice: formatPrice(price),
//     originalPrice: hasDiscount ? formatPrice(compareAtPrice) : undefined,
//     savings: hasDiscount ? formatPrice(compareAtPrice - price) : undefined,
//     hasDiscount,
//   };
// };

// /**
//  * Format line item price (price x quantity)
//  */
// export const formatLineItemPrice = (
//   price: number,
//   quantity: number
// ): LineItemPrice => {
//   return {
//     unitPrice: formatPrice(price),
//     lineTotal: formatPrice(price * quantity),
//     formattedLine: `${quantity} × ${formatPrice(price)}`,
//   };
// };

// // ==================== DISPLAY HELPER FUNCTIONS ====================

// /**
//  * Get shipping display text with appropriate styling
//  */
// export const getShippingDisplayText = (
//   items: CartItem[],
//   shipping: number
// ): ShippingDisplay => {
//   if (isDigitalOrder(items)) {
//     return {
//       text: "Digital - No shipping",
//       className: "text-blue-600",
//     };
//   }

//   if (shipping === 0) {
//     return {
//       text: "Free",
//       className: "text-green-600",
//     };
//   }

//   return {
//     text: formatPrice(shipping),
//     className: "text-gray-900",
//   };
// };

// /**
//  * Get free shipping message for cart
//  */
// export const getFreeShippingMessage = (
//   items: CartItem[],
//   subtotal: number
// ): string | null => {
//   if (isDigitalOrder(items)) {
//     return "Digital products will be delivered instantly to your email!";
//   }

//   if (subtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD) {
//     return "You qualify for free shipping!";
//   }

//   const needed = PRICING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;
//   return `Add ${formatPrice(needed)} more for free shipping`;
// };

// // ==================== STOCK DISPLAY FUNCTIONS ====================

// // /**
// //  * Get stock display text and styling for physical products only
// //  * Digital products should not display stock information
// //  */
// // export const getStockDisplay = (
// //   stock: number | null,
// //   isDigital: boolean
// // ): { text: string; className: string; isAvailable: boolean } => {
// //   // Digital products don't need stock display - handle this in components
// //   if (isDigital) {
// //     return {
// //       text: "Available",
// //       className: "text-green-600",
// //       isAvailable: true,
// //     };
// //   }

// //   if (stock === null) {
// //     return {
// //       text: "In Stock",
// //       className: "text-green-600",
// //       isAvailable: true,
// //     };
// //   }

// //   if (stock > 0) {
// //     return {
// //       text: `${stock} available`,
// //       className: "text-green-600",
// //       isAvailable: true,
// //     };
// //   }

// //   return {
// //     text: "Out of Stock",
// //     className: "text-red-600",
// //     isAvailable: false,
// //   };
// // };

// /**
//  * Get detailed stock text for cart items
//  */
// export const getDetailedStockText = (
//   stock: number | null,
//   isDigital: boolean
// ): string => {
//   if (isDigital) {
//     return "Digital product - unlimited availability";
//   }

//   if (stock === null) {
//     return "In stock";
//   }

//   if (stock > 0) {
//     return `${stock} available in stock`;
//   }

//   return "Currently out of stock";
// };
