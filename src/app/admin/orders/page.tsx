// app/admin/orders/page.tsx
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrdersSearchFilter } from "@/components/admin/orders/OrdersSearchFilter";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { getOrdersWithPagination } from "@/lib/orders";
import {
  OrderSearchFilters,
  OrderStatusFilter,
  OrderTypeFilter,
  PaymentStatusFilter,
} from "@/types/order";
import { AdminOrdersClient } from "@/components/admin/orders/AdminOrdersClient";
import Link from "next/link";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    type?: string;
    paymentStatus?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;

  // Parse query parameters with defaults
  const page = parseInt(params.page || "1", 10);
  const limit = parseInt(params.limit || "10", 10);

  // Extract search and filter parameters
  const filters: OrderSearchFilters = {
    search: params.search || undefined,
    status: (params.status as OrderStatusFilter) || undefined,
    type: (params.type as OrderTypeFilter) || undefined,
    paymentStatus: (params.paymentStatus as PaymentStatusFilter) || undefined,
  };

  // Fetch orders with pagination and filters
  const { orders, pagination } = await getOrdersWithPagination(
    page,
    limit,
    filters
  );

  // Show empty state only when no orders exist at all (no filters applied)
  const isFirstTimeEmpty =
    orders.length === 0 &&
    !filters.search &&
    !filters.status &&
    !filters.type &&
    !filters.paymentStatus;

  if (isFirstTimeEmpty) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No orders found
        </h3>
        <p className="text-gray-600 mb-4">
          Orders will appear here once customers start purchasing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeader title="Orders" subtitle="Manage your store orders" />

      {/* Search and Filter */}
      <OrdersSearchFilter
        initialSearch={filters.search}
        initialStatus={filters.status || "all"}
        initialType={filters.type || "all"}
        initialPaymentStatus={filters.paymentStatus || "all"}
      />

      {/* Orders Table with Results */}
      <div className="bg-white rounded-lg border">
        {orders.length === 0 ? (
          // Show filtered empty state when no results match filters
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders match your filters
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to see more results.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/orders">Clear Filters</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Pass orders data to client component */}
            <AdminOrdersClient orders={orders} />
            {/* Pagination - only show if there are results */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              total={pagination.totalItems}
              limit={pagination.limit}
            />
          </>
        )}
      </div>
    </div>
  );
}
