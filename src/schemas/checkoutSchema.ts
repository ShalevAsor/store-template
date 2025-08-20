// import { z } from "zod";

// // Checkout form validation schema - ONLY what user inputs
// export const CheckoutFormSchema = z.object({
//   customerName: z
//     .string()
//     .min(1, "Name is required")
//     .max(100, "Name is too long"),
//   customerEmail: z.string().email("Invalid email address").toLowerCase(),
//   customerPhone: z.string().optional(),
//   shippingAddress: z.string().optional(),
//   paymentMethod: z.enum(
//     ["card", "paypal", "stripe", "bank_transfer", "wallet"],
//     {
//       message: "Please select a valid payment method",
//     }
//   ),
// });

// // Export the form data type
// export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
import { z } from "zod";

// Base checkout form validation schema

const BaseCheckoutFormSchema = z.object({
  customerName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  customerEmail: z.email("Invalid email address").toLowerCase(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  paymentMethod: z.enum(
    ["card", "paypal", "stripe", "bank_transfer", "wallet"],
    { message: "Please select a valid payment method" }
  ),
});

// Function to create schema with conditional validation
export const createCheckoutFormSchema = (isDigitalOrder: boolean) => {
  return BaseCheckoutFormSchema.refine(
    (data) => {
      // if its a digital order, shipping address is not required
      if (isDigitalOrder) {
        return true;
      }
      // for physical orders, shipping address is required and must not be empty
      return data.shippingAddress && data.shippingAddress.trim().length > 0;
    },
    {
      message: "Shipping address is required for physical products",
      path: ["shippingAddress"], // This targets the shippingAddress field specifically
    }
  );
};

// Default schema for cases where we don't know if it's digital (fallback)
export const CheckoutFormSchema = BaseCheckoutFormSchema;

// Export the form data type
export type CheckoutFormData = z.infer<typeof BaseCheckoutFormSchema>;
