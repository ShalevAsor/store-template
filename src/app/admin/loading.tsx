import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function AdminLoading() {
  console.log("root loading triggered");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Loading Admin Page...
        </h2>
      </div>
    </div>
  );
}
