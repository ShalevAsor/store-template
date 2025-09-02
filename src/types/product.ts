import { Product, ProductImage, ProductStatus } from "@prisma/client";
// Product with image relation

export type ProductWithImages = Product & {
  images: ProductImage[];
};

// Serialized type for client components (Decimal to number)
export type SerializedProduct = Omit<
  ProductWithImages,
  "price" | "compareAtPrice"
> & {
  price: number;
  compareAtPrice: number | null;
  images: ProductImage[];
};

// Pagination result type
export type ProductsPaginationResult = {
  products: SerializedProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

// Search filters interface
export interface ProductSearchFilters {
  search?: string; // Search in product name and description
  productType?: "all" | "digital" | "physical"; // Filter by product type
  status?: ProductStatus; // Filter by product status (for admin)
  category?: string; // Filter by category
}

// Product creation/update data
export interface ProductCreateData {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number | null;
  sku?: string;
  category?: string;
  status: ProductStatus;
  isDigital: boolean;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  id: string;
}

export interface ValidationProductData {
  id: string;
  stock: number | null;
  isDigital: boolean;
  status: ProductStatus;
}
export { ProductStatus };
