// src/schemas/settingsSchema.ts
import { SUPPORTED_CURRENCY_CODES } from "@/utils/currencyUtils";
import { z } from "zod";

export const storeIdentitySchema = z.object({
  storeName: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters"),

  storeDescription: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  contactEmail: z.email("Must be valid Email address"),
});

export const storeOperationalSchema = z.object({
  // Currency selection - uses ISO 4217 codes from currencyUtils
  currency: z.enum(SUPPORTED_CURRENCY_CODES as [string, ...string[]], {
    message: "Please select a valid currency",
  }),

  // Tax rate as percentage (e.g., "17" for 17%)
  taxRate: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Tax rate must be a valid number (e.g., 17 or 17.5)"
    )
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num >= 0 && num <= 100;
      },
      { message: "Tax rate must be between 0 and 100" }
    ),

  // Free shipping threshold - user enters in major units (e.g., "100" for $100)
  // Converted to minor units when saved
  freeShippingThreshold: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g., 100 or 100.50)")
    .optional()
    .or(z.literal("")),

  // Standard shipping cost - user enters in major units (e.g., "25" for $25)
  // Converted to minor units when saved
  standardShippingCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g., 25 or 25.00)"),
});

export type StoreIdentityFormData = z.infer<typeof storeIdentitySchema>;
export type StoreOperationalFormData = z.infer<typeof storeOperationalSchema>;
