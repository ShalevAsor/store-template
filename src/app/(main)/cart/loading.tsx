import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CartLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Shopping Cart"
        description="Review your items and proceed to checkout when ready."
        className="mb-8"
      />

      {/* Loading Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Loading */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Items Count Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>

            {/* Cart Items Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    {/* Image skeleton */}
                    <div className="w-20 h-20 bg-gray-200 rounded-md animate-pulse"></div>

                    {/* Product info skeleton */}
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>

                    {/* Quantity controls skeleton */}
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* Price skeleton */}
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>

                    {/* Remove button skeleton */}
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping Skeleton */}
            <div className="border-t pt-6">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
            </div>
          </div>
        </div>

        {/* Cart Summary Loading */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-12 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center loading spinner for emphasis */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}
