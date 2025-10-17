import { Product, ProductImage, ProductStatus } from "@prisma/client";
import { PaginationMeta } from "./common";
// Product with image relation

export type ProductWithImages = Product & {
  images: ProductImage[];
};

export type ProductStatusFilter = ProductStatus | "all";

// // Serialized type for client components (Decimal to number)
// export type SerializedProduct = Omit<
//   ProductWithImages,
//   "price" | "compareAtPrice"
// > & {
//   price: number;
//   compareAtPrice: number | null;
//   images: ProductImage[];
// };

// Pagination result type
export type ProductsPaginationResult = {
  products: ProductWithImages[];
  pagination: PaginationMeta;
};

// Search filters interface
export interface ProductSearchFilters {
  search?: string; // Search in product name and description
  productType?: "all" | "digital" | "physical"; // Filter by product type
  status?: ProductStatusFilter; // Filter by product status (for admin)
  category?: string; // Filter by category
}

export interface ValidationProductData {
  id: string;
  stock: number | null;
  isDigital: boolean;
  status: ProductStatus;
}
export { ProductStatus };
