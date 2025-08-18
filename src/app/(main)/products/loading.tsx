import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ProductsLoading() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Image skeleton */}
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>

            {/* Content skeleton */}
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <LoadingSpinner text="Loading products..." />
      </div>
    </>
  );
}
