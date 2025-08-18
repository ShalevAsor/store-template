"use client";

import { ErrorMessage } from "@/components/shared/ErrorMessage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600">
            We're sorry, but something unexpected happened.
          </p>
        </div>

        <ErrorMessage
          message={error.message || "An unexpected error occurred"}
          onRetry={reset}
          className="mb-4"
        />

        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-sm text-blue-600 hover:text-blue-500 underline"
          >
            Go back home
          </button>
        </div>
      </div>
    </div>
  );
}
