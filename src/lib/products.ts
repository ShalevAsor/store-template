import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

// Serialized type for client components (Decimal -> number)
export type SerializedProduct = Omit<Product, "price"> & {
  price: number;
};

/**
 * Get a single product by ID
 */

export async function getProduct(
  id: string
): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return null;
    }
    // Convert Decimal to number for client components
    return {
      ...product,
      price: Number(product.price),
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Get all products
 */

export async function getProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    // convert decimal to number
    return products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Get related products (exclude current product)
 * For template purposes - can be enhanced with better logic later
 * TODO: Implement better logic
 */

export async function getRelatedProducts(
  currentProductId: string,
  limit: number = 3
): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          not: currentProductId,
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}
