"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ProductFormData, productFormSchema } from "@/schemas/productSchema";
import {
  ProductCreateData,
  ProductUpdateData,
  SerializedProduct,
} from "@/types/product";
import { generateUniqueSlug, serializeProduct } from "@/utils/productUtils";
import { getErrorMessage } from "@/utils/errorUtils";
import { z } from "zod";

export interface ProductActionResult {
  success: boolean;
  error?: string;
  data?: SerializedProduct;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Create a new product with images and auto-generated slug
 */
export async function createProduct(
  data: ProductFormData
): Promise<ProductActionResult> {
  try {
    // Validate form data
    const validatedData = productFormSchema.parse(data);
    const { images, ...productData } = validatedData;

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name);

    // Create product with optional images
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        compareAtPrice: validatedData.compareAtPrice ?? null,
        stock: validatedData.stock ?? null,
        sku: validatedData.sku || undefined,
        images: images.length
          ? {
              createMany: {
                data: images.map((img, index) => ({
                  imageUrl: img.imageUrl,
                  altText: img.altText ?? "",
                  sortOrder: img.sortOrder ?? index,
                })),
              },
            }
          : undefined,
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    // Revalidate relevant pages
    revalidateProductPaths(product.slug);

    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid data provided",
        fieldErrors: z.treeifyError(error),
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Update an existing product
 * Regenerates slug if name changes
 */

export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<ProductActionResult> {
  try {
    // ✅ Validate form data with zod
    const validatedData = productFormSchema.parse(data);
    const { images, ...updateData } = validatedData;

    const finalUpdateData: Partial<ProductFormData> & { slug?: string } = {
      ...updateData,
    };

    //  Regenerate slug if name changed
    if (updateData.name) {
      finalUpdateData.slug = await generateUniqueSlug(updateData.name, id);
    }

    //  Handle images (replace existing with new ones)
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...finalUpdateData,
        compareAtPrice: validatedData.compareAtPrice ?? null,
        stock: validatedData.stock ?? null,
        sku: validatedData.sku || undefined,
        images: {
          deleteMany: {}, // remove old images
          createMany: {
            data: images.map((img, index) => ({
              imageUrl: img.imageUrl,
              altText: img.altText ?? "",
              sortOrder: img.sortOrder ?? index,
            })),
          },
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    // Revalidate relevant paths
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error updating product:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid data provided",
        fieldErrors: z.treeifyError(error),
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Delete product server action
 * @param id
 * @returns
 */

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  try {
    // Delete the product and its images (cascade)
    const product = await prisma.product.delete({
      where: { id },
    });

    // Revalidate relevant pages
    revalidateProductPaths(product.slug);

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

function revalidateProductPaths(slug?: string) {
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/products/${slug}`);
}
