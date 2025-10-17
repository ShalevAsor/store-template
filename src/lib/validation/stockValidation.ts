import type { CartItem } from "@/types/cart";
import type { StockAdjustment } from "@/types/stock";
import { Prisma } from "@prisma/client";

export interface StockValidationResult {
  productErrors: string[];
  stockIssues: StockAdjustment[];
  adjustedTotal: number;
}

/**
 * Validate cart items and check stock - extracted from your checkout action
 * Returns the same data your original loop produces
 */
export async function validateCartItemsAndStock(
  cartItems: CartItem[],
  tx: Prisma.TransactionClient
): Promise<StockValidationResult> {
  const productErrors: string[] = [];
  const stockIssues: StockAdjustment[] = [];
  let adjustedTotal = 0;

  // Get all products in one query instead of N+1
  const productIds = cartItems.map((item) => item.id);
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      stock: true,
      status: true,
      price: true,
    },
  });

  // Create lookup map
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Your exact validation logic - just moved here
  for (const item of cartItems) {
    const product = productMap.get(item.id);

    // Product not found or not active
    if (!product || product.status !== "ACTIVE") {
      productErrors.push(`Product "${item.name}" is no longer available`);
      continue;
    }

    // Price mismatch (potential tampering)
    if (product.price !== item.price) {
      productErrors.push(
        `Price for "${item.name}" has changed. Please refresh your cart.`
      );
      continue;
    }

    // Check stock availability (only for products with limited stock)
    if (product.stock !== null) {
      if (product.stock === 0) {
        stockIssues.push({
          productId: item.id,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: 0,
          action: "removed",
        });
      } else if (product.stock < item.quantity) {
        stockIssues.push({
          productId: item.id,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: product.stock,
          action: "reduced",
        });
        // Add reduced quantity to adjusted total
        adjustedTotal += item.price * product.stock;
      } else {
        // No stock issues - add full quantity to adjusted total
        adjustedTotal += item.price * item.quantity;
      }
    } else {
      // Unlimited stock - add full quantity to adjusted total
      adjustedTotal += item.price * item.quantity;
    }
  }

  return { productErrors, stockIssues, adjustedTotal };
}

/**
 * Apply stock adjustments to cart items - extracted from your checkout action
 */
export function applyStockAdjustments(
  cartItems: CartItem[],
  stockIssues: StockAdjustment[]
): CartItem[] {
  return cartItems
    .filter((item) => {
      const adjustment = stockIssues.find((adj) => adj.productId === item.id);
      return adjustment?.action !== "removed";
    })
    .map((item) => {
      const adjustment = stockIssues.find((adj) => adj.productId === item.id);
      if (adjustment?.action === "reduced") {
        return {
          ...item,
          quantity: adjustment.availableQuantity,
        };
      }
      return item;
    });
}
