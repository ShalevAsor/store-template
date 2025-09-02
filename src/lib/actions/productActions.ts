"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ProductCreateData,
  ProductUpdateData,
  SerializedProduct,
} from "@/types/product";
import { generateUniqueSlug, serializeProduct } from "@/utils/productUtils";
import { ActionResult } from "next/dist/server/app-render/types";
import { getErrorMessage } from "@/utils/errorUtils";

export interface ProductActionResult {
  success: boolean;
  error?: string;
  data?: SerializedProduct;
}

/**
 * Create a new product with auto-generated slug
 */

export async function createProduct(
  data: ProductCreateData
): Promise<ProductActionResult> {
  try {
    const slug = await generateUniqueSlug(data.name);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    // Revalidate admin products page
    revalidatePath("/admin/products");

    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error creating product:", error);
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
  data: ProductUpdateData
): Promise<ProductActionResult> {
  try {
    const { id, ...updateData } = data;

    // Prepare update data
    const finalUpdateData: Partial<ProductCreateData> & { slug?: string } = {
      ...updateData,
    };

    // If name is being updated, regenerate slug
    if (updateData.name) {
      finalUpdateData.slug = await generateUniqueSlug(updateData.name, id);
    }

    const product = await prisma.product.update({
      where: { id },
      data: finalUpdateData,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    // Revalidate relevant pages
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: serializeProduct(product),
    };
  } catch (error) {
    console.error("Error updating product:", error);

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
    const product = await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
