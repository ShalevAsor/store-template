// import { z } from "zod";
// import { ProductImage, ProductStatus } from "@prisma/client";
// import { SerializedProduct } from "@/types/product";

// /**
//  * Product form validation schema
//  * Used for both creating and editing products
//  */

// export const productFormSchema = z
//   .object({
//     // Required fields
//     name: z
//       .string()
//       .min(1, "Product name is required")
//       .max(255, "Product name must be less than 255 characters")
//       .trim(),
//     price: z
//       .number({
//         message: "Price must be a valid number",
//       })
//       .min(0.01, "Price must be at least $0.01")
//       .max(999999.99, "Price cannot exceed $999,999.99"),

//     status: z.nativeEnum(ProductStatus),

//     isDigital: z.boolean(),
//     // Optional fields
//     description: z
//       .string()
//       .max(2000, "Description must be less than 2000 characters")
//       .optional(),

//     compareAtPrice: z
//       .number()
//       .min(0, "Compare at price cannot be negative")
//       .max(999999.99, "Compare at price cannot exceed $999,999.99")
//       .optional()
//       .nullable(),

//     stock: z
//       .number()
//       .int("Stock must be a whole number")
//       .min(0, "Stock cannot be negative")
//       .optional()
//       .nullable(), // null = unlimited stock

//     sku: z.string().max(100, "SKU must be less than 100 characters").optional(),

//     category: z
//       .string()
//       .max(100, "Category must be less than 100 characters")
//       .optional(),

//     // Temporary image URLs (until S3 implementation)
//     images: z
//       .array(
//         z.object({
//           imageUrl: z
//             .string()
//             .url("Please enter a valid image URL")
//             .max(500, "Image URL too long"),
//           altText: z
//             .string()
//             .max(200, "Alt text must be less than 200 characters")
//             .optional(),
//           sortOrder: z.number().int().min(0).default(0),
//         })
//       )
//       .default([]),
//   })
//   .superRefine((data, ctx) => {
//     // Custom validation: compareAtPrice must be higher than price
//     if (data.compareAtPrice && data.compareAtPrice <= data.price) {
//       ctx.addIssue({
//         code: "custom",
//         message: "Compare at price must be higher than regular price",
//         path: ["compareAtPrice"],
//       });
//     }

//     // Custom validation: Digital products shouldn't have stock limits
//     if (data.isDigital && data.stock !== null && data.stock !== undefined) {
//       ctx.addIssue({
//         code: "custom",
//         message: "Digital products should have unlimited stock",
//         path: ["stock"],
//       });
//     }
//   });

// // Infer the TypeScript type from the schema
// export type ProductFormData = z.infer<typeof productFormSchema>;

// // Default form values for creating a new product
// export const defaultProductValues: ProductFormData = {
//   name: "",
//   description: "",
//   price: 0,
//   compareAtPrice: null,
//   stock: null, // null = unlimited stock by default
//   sku: "",
//   category: "",
//   status: ProductStatus.DRAFT,
//   isDigital: false,
//   images: [],
// };

// // Helper function to convert SerializedProduct to form data
// export function productToFormData(product: SerializedProduct): ProductFormData {
//   return {
//     name: product.name,
//     description: product.description || "",
//     price: product.price,
//     compareAtPrice: product.compareAtPrice,
//     stock: product.stock,
//     sku: product.sku || "",
//     category: product.category || "",
//     status: product.status,
//     isDigital: product.isDigital,
//     images:
//       product.images?.map((img: ProductImage, index: number) => ({
//         imageUrl: img.imageUrl,
//         altText: img.altText || "",
//         sortOrder: img.sortOrder || index,
//       })) || [],
//   };
// }
import { z } from "zod";
import { ProductImage, ProductStatus } from "@prisma/client";
import { SerializedProduct } from "@/types/product";

/**
 * Product form validation schema
 * Used for both creating and editing products
 */
export const productFormSchema = z
  .object({
    // Required fields
    name: z
      .string()
      .min(1, "Product name is required")
      .max(255, "Product name must be less than 255 characters")
      .trim(),

    price: z
      .number({
        message: "Price must be a valid number",
      })
      .min(0.01, "Price must be at least $0.01")
      .max(999999.99, "Price cannot exceed $999,999.99"),

    status: z.enum(ProductStatus),

    isDigital: z.boolean(),

    images: z.array(
      z.object({
        imageUrl: z
          .url("Please enter a valid image URL")
          .max(500, "Image URL too long"),
        altText: z
          .string()
          .max(200, "Alt text must be less than 200 characters")
          .optional(),
        sortOrder: z.number().int().min(0),
      })
    ),

    // Optional fields
    description: z
      .string()
      .max(2000, "Description must be less than 2000 characters")
      .optional(),

    compareAtPrice: z
      .number()
      .min(0, "Compare at price cannot be negative")
      .max(999999.99, "Compare at price cannot exceed $999,999.99")
      .optional()
      .nullable(),

    stock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative")
      .optional()
      .nullable(),

    sku: z.string().max(100, "SKU must be less than 100 characters").optional(),

    category: z
      .string()
      .max(100, "Category must be less than 100 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Custom validation: compareAtPrice must be higher than price
    if (data.compareAtPrice && data.compareAtPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        message: "Compare at price must be higher than regular price",
        path: ["compareAtPrice"],
      });
    }

    // Custom validation: Digital products shouldn't have stock limits
    if (data.isDigital && data.stock !== null && data.stock !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Digital products should have unlimited stock",
        path: ["stock"],
      });
    }
  });

// Infer the TypeScript type from the schema
export type ProductFormData = z.infer<typeof productFormSchema>;

// Default form values for creating a new product
export const defaultProductValues: ProductFormData = {
  name: "",
  price: 0,
  status: ProductStatus.DRAFT,
  isDigital: false,
  images: [],
  description: undefined,
  compareAtPrice: null,
  stock: null,
  sku: undefined,
  category: undefined,
};

// Helper function to convert SerializedProduct to form data
export function productToFormData(product: SerializedProduct): ProductFormData {
  return {
    name: product.name,
    price: product.price,
    status: product.status,
    isDigital: product.isDigital,
    images:
      product.images?.map((img: ProductImage, index: number) => ({
        imageUrl: img.imageUrl,
        altText: img.altText || undefined,
        sortOrder: img.sortOrder || index,
      })) || [],
    description: product.description || undefined,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    sku: product.sku || undefined,
    category: product.category || undefined,
  };
}
