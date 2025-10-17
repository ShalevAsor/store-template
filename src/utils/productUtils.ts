import { prisma } from "@/lib/prisma";
import { ProductWithImages } from "@/types/product";

/**
 * Generate URL-friendly slug from product name
 * Converts "Amazing T-Shirt!" to "amazing-t-shirt"
 */

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generate unique slug by appending numbers if necessary
 * "cool-shirt" -> "cool-shirt-2" if "cool-shirt" exists
 */
export async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name);
  let uniqueSlug = baseSlug;
  let counter = 1;
  while (true) {
    // check if slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    });
    // If no existing product, or it's the current product being updated
    if (!existingProduct || existingProduct.id === excludeId) {
      return uniqueSlug;
    }
    // Generate next variant
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

