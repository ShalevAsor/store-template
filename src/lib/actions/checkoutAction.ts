"use server";

import {
  createCheckoutFormSchema,
  type CheckoutFormData,
} from "@/schemas/checkoutSchema";
import { createOrder } from "@/lib/orders";
import { CartItem } from "@/types/cart";
import { CreateOrderData } from "@/types/order";
import { StockAdjustment } from "@/types/stock";
import { isDigitalOrder, validateCartItems } from "@/utils/orderUtils";
import { getErrorMessage } from "@/utils/errorUtils";
import { calculateOrderTotals } from "@/utils/orderUtils";
import { prisma } from "@/lib/prisma";

// Updated server action return type
export interface CheckoutResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  orderId?: string;

  // Stock validation fields
  stockIssues?: StockAdjustment[];
  adjustedTotal?: number;
  needsConfirmation?: boolean;
}

/**
 * Validate current stock levels for cart items
 */
async function validateCurrentStock(cartItems: CartItem[]): Promise<{
  hasIssues: boolean;
  adjustments: StockAdjustment[];
  adjustedTotal: number;
}> {
  const adjustments: StockAdjustment[] = [];
  const adjustedItems: CartItem[] = [];

  for (const item of cartItems) {
    // Get current stock from database
    const product = await prisma.product.findUnique({
      where: { id: item.id },
      select: { stock: true, name: true },
    });

    if (!product) {
      // Product not found - treat as removed
      adjustments.push({
        productId: item.id,
        productName: item.name,
        requestedQuantity: item.quantity,
        availableQuantity: 0,
        action: "removed",
      });
      continue;
    }

    // Check stock availability (applies to all products, digital or physical)
    if (product.stock === null) {
      // Unlimited stock - no adjustment needed
      adjustedItems.push(item);
    } else if (product.stock === 0) {
      // Out of stock - remove item
      adjustments.push({
        productId: item.id,
        productName: product.name,
        requestedQuantity: item.quantity,
        availableQuantity: 0,
        action: "removed",
      });
    } else if (product.stock < item.quantity) {
      // Insufficient stock - reduce quantity
      adjustments.push({
        productId: item.id,
        productName: product.name,
        requestedQuantity: item.quantity,
        availableQuantity: product.stock,
        action: "reduced",
      });
      adjustedItems.push({
        ...item,
        quantity: product.stock,
      });
    } else {
      // Sufficient stock - no adjustment needed
      adjustedItems.push(item);
    }
  }

  // Calculate new total with adjusted items
  const adjustedTotals = calculateOrderTotals(adjustedItems);

  return {
    hasIssues: adjustments.length > 0,
    adjustments,
    adjustedTotal: adjustedTotals.total,
  };
}

/**
 * Main checkout server action
 */
export async function processCheckout(
  formData: CheckoutFormData,
  cartItems: CartItem[],
  options?: { confirmed?: boolean }
): Promise<CheckoutResult> {
  try {
    // Validate cart items first
    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.success) {
      return { success: false, error: cartValidation.error };
    }

    // Stock validation - skip if user already confirmed
    if (!options?.confirmed) {
      const stockValidation = await validateCurrentStock(cartItems);
      if (stockValidation.hasIssues) {
        return {
          success: false,
          stockIssues: stockValidation.adjustments,
          adjustedTotal: stockValidation.adjustedTotal,
          needsConfirmation: true,
        };
      }
    }

    // Determine if order is digital
    const orderIsDigital = isDigitalOrder(cartItems);

    // Server-side form validation
    const validationSchema = createCheckoutFormSchema(orderIsDigital);
    const validationResult = validationSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};

      validationResult.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Please check the form for errors",
        fieldErrors,
      };
    }

    const validatedForm = validationResult.data;

    // Prepare order data
    const orderData: CreateOrderData = {
      customerName: validatedForm.customerName.trim(),
      customerEmail: validatedForm.customerEmail.trim(),
      customerPhone: validatedForm.customerPhone?.trim(),
      shippingAddress: validatedForm.shippingAddress?.trim(),
      paymentMethod: validatedForm.paymentMethod,
      isDigital: orderIsDigital,
      items: cartItems.map((item) => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    // Create order in database (this will do final stock validation with transaction)
    console.log("Creating order with items:", orderData.items);

    const order = await createOrder(orderData);

    // TODO: Process payment, send emails, etc.
    console.log(
      `Order ${order.id} created successfully for ${order.customerEmail}`
    );

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    console.error("Checkout error:", error);

    // Handle redirect errors
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }

    // Handle stock errors from createOrder
    if (error instanceof Error && error.message.includes("stock")) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
