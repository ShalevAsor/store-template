import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading...</h2>
        <p className="text-sm text-gray-500">
          Please wait while we prepare your page
        </p>
      </div>
    </div>
  );
}
