// src/schemas/checkoutSchema.ts
import { z } from "zod";

// Structured address schema - country is required with default
const AddressSchema = z.object({
  line1: z.string().min(1, "Street address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z
    .string()
    .length(2, "Country code must be 2 letters (e.g., US, IL)"),
});

// Single checkout form schema - shipping address is always optional
export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  customerEmail: z.email("Invalid email address").toLowerCase(),
  customerPhone: z.string().optional(),
  shippingAddress: AddressSchema.optional(), // Always optional at schema level
  paymentMethod: z.enum(
    ["card", "paypal", "stripe", "bank_transfer", "wallet"],
    { message: "Please select a valid payment method" }
  ),
});

// Export the form data type
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type ShippingAddress = z.infer<typeof AddressSchema>;
