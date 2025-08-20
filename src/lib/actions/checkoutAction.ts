"use server";

import {
  createCheckoutFormSchema,
  type CheckoutFormData,
} from "@/schemas/checkoutSchema";
import { createOrder, CreateOrderData } from "@/lib/orders";
import { CartItem } from "@/types/cart";
import { isDigitalOrder } from "@/utils/orderUtils";

// Server action return type
export interface CheckoutResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  orderId?: string;
}

/**
 * Validate cart items
 */
function validateCartItems(cartItems: CartItem[]): string | null {
  if (!cartItems || cartItems.length === 0) {
    return "Cart is empty";
  }

  for (const item of cartItems) {
    if (!item.id || !item.name || item.price <= 0 || item.quantity <= 0) {
      return "Invalid item in cart";
    }
  }

  return null;
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
    const cartError = validateCartItems(cartItems);
    if (cartError) {
      return { success: false, error: cartError };
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

    // Business logic validation
    // Example: Check if email domain is allowed, verify payment method availability, etc.

    // Example business rule: Block certain email domains
    const blockedDomains = ["tempmail.com", "guerrillamail.com"];
    const emailDomain = validatedForm.customerEmail
      .split("@")[1]
      ?.toLowerCase();
    if (emailDomain && blockedDomains.includes(emailDomain)) {
      return {
        success: false,
        error: "Please use a valid email address",
        fieldErrors: {
          customerEmail: ["This email domain is not allowed"],
        },
      };
    }

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

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("redirect")) {
        // This is a redirect, let it through
        throw error;
      }

      // Handle database errors
      if (
        error.message.includes("Unique constraint") ||
        error.message.includes("duplicate")
      ) {
        return {
          success: false,
          error:
            "An order with this information already exists. Please try again.",
        };
      }

      // Handle other known errors
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
