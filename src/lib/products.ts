"use server";
import { prisma } from "@/lib/prisma";
import {
  SerializedProduct,
  ProductSearchFilters,
  ProductsPaginationResult,
  ProductStatus,
  ValidationProductData,
} from "@/types/product";
import {
  calculatePagination,
  getDefaultPagination,
  validatePaginationParams,
} from "@/utils/paginationUtils";
import { serializeProduct } from "@/utils/productUtils";
import { Prisma } from "@prisma/client";

// ==================== QUERY FUNCTIONS ====================

/**
 * Get a single product by ID with images
 * Only returns ACTIVE products for customer-facing pages
 */

export async function getProductByID(
  id: string
): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
        status: ProductStatus.ACTIVE,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!product) {
      return null;
    }
    return serializeProduct(product);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    return null;
  }
}

/**
 * Get a single product by slug with images
 * Only returns ACTIVE products for customer-facing pages
 */

export async function getProductBySlug(
  slug: string
): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!product) {
      return null;
    }
    return serializeProduct(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/**
 * Get a single product by ID for admin (any status)
 */

export async function getProductForAdmin(
  id: string
): Promise<SerializedProduct | null> {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!product) {
      return null;
    }
    return serializeProduct(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Get all active products for customer-facing pages
 */

export async function getProducts(): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!products) {
      return [];
    }
    return products.map((product) => serializeProduct(product));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Get products stock by ids  -  used in cart page
 * @param ids
 * @returns
 */
export async function getProductsStock(
  ids: string[]
): Promise<Record<string, number | null>> {
  try {
    if (ids.length === 0) return {};

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        status: ProductStatus.ACTIVE,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    return products.reduce((acc, product) => {
      acc[product.id] = product.stock;
      return acc;
    }, {} as Record<string, number | null>);
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return {};
  }
}

/**
 * Get minimal product data needed for order validation
 */
export async function getProductsForValidation(
  ids: string[]
): Promise<ValidationProductData[]> {
  try {
    if (ids.length === 0) return [];

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        stock: true,
        isDigital: true,
        status: true,
      },
    });

    return products;
  } catch (error) {
    console.error("Error fetching products for validation:", error);
    return [];
  }
}

/**
 * Get related products (exclude current product)
 * Only returns ACTIVE products for customer-facing pages
 * TODO: add currentProductCatergory optional imput and return products from the same cetegory
 */

export async function getRelatedProducts(
  currentProductSlug: string,
  limit: number = 3
): Promise<SerializedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        slug: { not: currentProductSlug },
        status: ProductStatus.ACTIVE,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    if (!products) {
      return [];
    }
    return products.map((product) => serializeProduct(product));
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

/**
 * Get products with pagination, search, and filtering for admin
 * Returns products of any status for admin management
 */
export async function getProductsWithPagination(
  page: number = 1,
  limit: number = 10,
  filters: ProductSearchFilters = {}
): Promise<ProductsPaginationResult> {
  // Ensure valid pagination parameters
  const { currentPage, take, skip } = validatePaginationParams(page, limit);
  try {
    // Build where clause based on filters
    const whereClause: Prisma.ProductWhereInput = {};

    // Search filter - searches in name, description, AND sku
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      whereClause.OR = [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    // Product type filter
    if (filters.productType && filters.productType !== "all") {
      whereClause.isDigital = filters.productType === "digital";
    }

    // Status filter - Fixed to handle "all" value properly
    if (filters.status && filters.status !== "all") {
      whereClause.status = filters.status;
    }

    // Category filter
    if (filters.category && filters.category.trim()) {
      whereClause.category = {
        contains: filters.category.trim(),
        mode: "insensitive",
      };
    }

    // Get products and total count in parallel with filters applied
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Serialize products for client components
    const serializedProducts = products.map(serializeProduct);

    // Calculate pagination metadata

    const pagination = calculatePagination(currentPage, limit, total);

    return {
      products: serializedProducts,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching products with pagination:", error);
    return {
      products: [],
      pagination: getDefaultPagination(limit),
    };
  }
}
