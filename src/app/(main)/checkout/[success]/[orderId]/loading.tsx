import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CheckoutSuccessLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="text-gray-400">/</div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="text-gray-400">/</div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Success Header skeleton */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>

      {/* Order Summary skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Order Details skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items Card */}
          <div className="border rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-28 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps skeleton */}
      <div className="border rounded-lg p-6 mb-8">
        <div className="h-6 bg-gray-200 rounded w-28 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded mt-0.5 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Loading spinner at bottom */}
      <div className="text-center mt-8">
        <LoadingSpinner text="Loading order confirmation..." />
      </div>
    </div>
  );
}
