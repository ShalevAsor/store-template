"use server";

import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/common";
import { CartItem } from "@/types/cart";
import { CheckoutFormData, checkoutFormSchema } from "@/schemas/checkoutSchema";
import { createErrorResult } from "@/utils/errorUtils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  applyStockAdjustments,
  validateCartItemsAndStock,
} from "../validation/stockValidation";
import { createOrderWithItems, updateStockForOrder } from "./orderActions";

interface ProcessCheckoutOptions {
  confirmed?: boolean; // User confirmed they want to proceed with stock adjustments
}

/**
 * Process checkout in a single atomic transaction
 * Orchestrates validation, stock management, and order creation
 */
export async function processCheckout(
  formData: CheckoutFormData,
  cartItems: CartItem[],
  options: ProcessCheckoutOptions = {}
): Promise<ActionResult<{ orderId: string }>> {
  try {
    console.log("Processing checkout:", {
      customerEmail: formData.customerEmail,
      itemCount: cartItems.length,
      isConfirmed: options.confirmed,
    });

    // Validate form data with zod checkout schema
    const validatedData = checkoutFormSchema.parse(formData);

    // Ensure we have items
    if (!cartItems || cartItems.length === 0) {
      return createErrorResult({
        message: "Your cart is empty. Please add items before checkout.",
      });
    }

    // Process everything in a single atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Validate cart items and check stock
      const { productErrors, stockIssues, adjustedTotal } =
        await validateCartItemsAndStock(cartItems, tx);

      // Handle validation errors
      if (productErrors.length > 0) {
        throw new Error(productErrors.join(". "));
      }

      // Handle stock confirmation if needed
      if (stockIssues.length > 0 && !options.confirmed) {
        throw new Error(
          `STOCK_CONFIRMATION_NEEDED:${JSON.stringify({
            stockIssues,
            adjustedTotal,
          })}`
        );
      }

      // Apply stock adjustments if user confirmed
      let finalCartItems = cartItems;
      if (stockIssues.length > 0 && options.confirmed) {
        finalCartItems = applyStockAdjustments(cartItems, stockIssues);
      }

      // Update product stock levels
      // await updateStockForOrder(finalCartItems, tx);

      // Create the order
      const order = await createOrderWithItems(
        validatedData,
        finalCartItems,
        tx
      );

      return order;
    });

    console.log("Order created successfully:", {
      orderId: result.id,
      orderNumber: result.orderNumber,
    });

    revalidatePath("/cart");

    return {
      success: true,
      data: { orderId: result.id },
    };
  } catch (error) {
    console.error("Checkout processing error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const flattened = z.flattenError(error);
      return {
        success: false,
        error: "Invalid data provided",
        fieldErrors: flattened.fieldErrors,
      };
    }

    // Handle stock confirmation needed error
    if (
      error instanceof Error &&
      error.message.startsWith("STOCK_CONFIRMATION_NEEDED:")
    ) {
      const stockData = JSON.parse(
        error.message.replace("STOCK_CONFIRMATION_NEEDED:", "")
      );
      return {
        success: false,
        error: "Some items in your cart have insufficient stock",
        needsConfirmation: true,
        stockIssues: stockData.stockIssues,
        adjustedTotal: stockData.adjustedTotal,
      };
    }

    return createErrorResult({ error });
  }
}
