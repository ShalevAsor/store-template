"use server";

import {
  createCheckoutFormSchema,
  type CheckoutFormData,
} from "@/schemas/checkoutSchema";
import { createOrder, CreateOrderData } from "@/lib/orders";
import { CartItem } from "@/types/cart";
import {
  isDigitalOrder,
  validateCartItems,
  validateCartStock,
} from "@/utils/orderUtils";
import { getErrorMessage } from "@/utils/errorUtils";

// Server action return type
export interface CheckoutResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  orderId?: string;
}

/**
 * Main checkout server action - now receives validated form data
 */
export async function processCheckout(
  formData: CheckoutFormData,
  cartItems: CartItem[]
): Promise<CheckoutResult> {
  try {
    // Validate cart items first
    const cartValidation = validateCartItems(cartItems);
    if (!cartValidation.success) {
      return { success: false, error: cartValidation.error };
    }
    // validate stock
    const stockValidation = await validateCartStock(cartItems);
    if (!stockValidation.success) {
      return {
        success: false,
        error: stockValidation.message || "Stock validation failed",
      };
    }

    // Determine if order is digital
    const orderIsDigital = isDigitalOrder(cartItems);

    // Server-side validation as a safety net
    // This ensures data integrity even if client validation is bypassed
    const validationSchema = createCheckoutFormSchema(orderIsDigital);
    const validationResult = validationSchema.safeParse(formData);

    if (!validationResult.success) {
      // Return validation errors if any (shouldn't happen with proper client validation)
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

    // Create order in database
    const order = await createOrder(orderData);

    // TODO: Here you would typically:
    // 1. Process payment with chosen payment method
    // 2. Send confirmation email
    // 3. For digital products: generate download links
    // 4. For physical products: create shipping label

    console.log(
      `Order ${order.id} created successfully for ${order.customerEmail}`
    );

    // Return success with order ID (no redirect)
    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    console.error("Checkout error:", error);
    // Handle redirect errors (let them through)
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }

    // Use centralized error handling
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
