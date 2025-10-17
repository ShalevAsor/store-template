"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ProductFormData, productFormSchema } from "@/schemas/productSchema";
import { generateUniqueSlug } from "@/utils/productUtils";
import { getErrorMessage } from "@/utils/errorUtils";
import { z } from "zod";
import { deleteImagesFromS3 } from "@/services/s3";
import { ProductWithImages } from "@/types/product";
import { majorUnitToMinor } from "@/utils/currencyUtils";

export interface ProductActionResult {
  success: boolean;
  error?: string;
  data?: ProductWithImages;
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
    // Covert prices from Dollars to cents
    const priceInCents = majorUnitToMinor(productData.price);
    const compareAtPriceInCents = productData.compareAtPrice
      ? majorUnitToMinor(productData.compareAtPrice)
      : null;
    // Create product with optional images
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        price: priceInCents,
        compareAtPrice: compareAtPriceInCents,
        stock: validatedData.stock ?? null,
        sku: validatedData.sku || undefined,
        images: images.length
          ? {
              createMany: {
                data: images.map((img, index) => ({
                  imageKey: img.imageKey,
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
      data: product,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    // if we already upload images remove them from s3
    const images = data.images;
    if (images && images.length > 0) {
      const imageKeys = images.map((img) => img.imageKey);
      await deleteImagesFromS3(imageKeys);
    }

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
    // Validate form data with zod
    const validatedData = productFormSchema.parse(data);
    const { images, ...updateData } = validatedData;

    // Convert Prices from dollars to cents

    const finalUpdateData: Partial<ProductFormData> & { slug?: string } = {
      ...updateData,
      price: majorUnitToMinor(updateData.price),
      compareAtPrice: updateData.compareAtPrice
        ? majorUnitToMinor(updateData.compareAtPrice)
        : null,
    };

    // Regenerate slug if name changed
    if (updateData.name) {
      finalUpdateData.slug = await generateUniqueSlug(updateData.name, id);
    }

    // Get existing images before deleting them
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Get old and new image keys
    const oldImageKeys = existingProduct.images.map((img) => img.imageKey);
    const newImageKeys = images.map((img) => img.imageKey);

    // Find images that are being removed (exist in old but not in new)
    const imagesToDelete = oldImageKeys.filter(
      (key) => !newImageKeys.includes(key)
    );

    // Normalize sort order for remaining images (0, 1, 2, etc.)
    const normalizedImages = images.map((img, index) => ({
      imageKey: img.imageKey,
      altText: img.altText ?? "",
      sortOrder: index, // Use array index for consistent ordering
    }));

    // Handle images (replace existing with new ones)
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...finalUpdateData,
        images: {
          deleteMany: {}, // remove old images
          createMany: {
            data: normalizedImages,
          },
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    // Only clean up images that were actually removed
    if (imagesToDelete.length > 0) {
      await deleteImagesFromS3(imagesToDelete);
    }

    // Revalidate relevant paths
    revalidatePath("/admin/products");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Error updating product:", error);

    // If we already uploaded new images, remove them from s3
    const images = data.images;
    if (images && images.length > 0) {
      const imageKeys = images.map((img) => img.imageKey);
      await deleteImagesFromS3(imageKeys);
    }

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
    // Get product with images before deleting
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Extract image keys before deletion
    const imageKeys = product.images.map((img) => img.imageKey);

    // Delete the product and its images (cascade)
    await prisma.product.delete({
      where: { id },
    });

    // Clean up images from S3
    if (imageKeys.length > 0) {
      await deleteImagesFromS3(imageKeys);
    }

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
