import Link from "next/link";

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Resource Not Found
          </h2>
          <p className="text-gray-500">
            {
              "The resource you're looking for doesn't exist or has been removed."
            }
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
          >
            Back To Dashboard
          </Link>

          <div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 underline text-sm"
            >
              Back To Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
