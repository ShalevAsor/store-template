import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { ProductsSearchFilter } from "@/components/admin/ProductsSearchFilter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getProductsWithPagination } from "@/lib/products";
import { Pagination } from "@/components/shared/Pagination";
import { ProductSearchFilters, ProductStatusFilter } from "@/types/product";

interface AdminProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    productType?: string;
    status?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  // Await searchParams before using its properties
  const params = await searchParams;

  // Parse query parameters with defaults
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  // Extract search and filter parameters
  const filters: ProductSearchFilters = {
    search: params.search || undefined,
    productType:
      (params.productType as "all" | "digital" | "physical") || undefined,
    status: (params.status as ProductStatusFilter) || undefined,
  };

  // Fetch products with pagination and filters
  const { products, pagination } = await getProductsWithPagination(
    page,
    limit,
    filters
  );

  // Show empty state only when no products exist at all (no filters applied)
  const isFirstTimeEmpty =
    products.length === 0 &&
    !filters.search &&
    !filters.productType &&
    !filters.status;

  if (isFirstTimeEmpty) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 mb-4">Please add products first</p>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AdminHeader title="Products" subtitle="Manage your store products" />
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <ProductsSearchFilter
        initialSearch={filters.search}
        initialProductType={filters.productType || "all"}
        initialStatus={filters.status || "all"} // Add this line
      />

      {/* Products Table with Results */}
      <div className="bg-white rounded-lg border">
        {products.length === 0 ? (
          // Show filtered empty state when no results match filters
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products match your filters
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to see more results.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/products">Clear Filters</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/products/new">Add Product</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ProductsTable products={products} />
            {/* Pagination - only show if there are results */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              total={pagination.total}
              limit={pagination.limit}
            />
          </>
        )}
      </div>
    </div>
  );
}
