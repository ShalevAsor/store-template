"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Home, RefreshCw, Search } from "lucide-react";

interface ProductErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    // Log error for debugging (in production, send to error tracking service)
    console.error("Product page error:", error);
  }, [error]);

  // Check if it's a "not found" type error
  const isNotFound =
    error.message.includes("not found") ||
    error.message.includes("404") ||
    error.message.includes("NOTFOUND");

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Main Error Message */}
      <div className="mb-8">
        <ErrorMessage
          variant={isNotFound ? "warning" : "error"}
          message={
            isNotFound
              ? "Product not found. The product you're looking for doesn't exist or may have been removed."
              : "We encountered an issue while loading this product. Please try again or browse our other products."
          }
          onRetry={!isNotFound ? reset : undefined}
          className="mb-6"
        />

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isNotFound ? "Product Not Found" : "Something Went Wrong"}
          </h1>
          <p className="text-gray-600">
            {isNotFound
              ? "Don't worry, we have many other great products for you to discover!"
              : "Our team has been notified and is working to fix this issue."}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        {/* Browse Products - Primary Action */}
        <Button
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
        >
          <Link href="/products">
            <Search className="w-4 h-4 mr-2" />
            Browse Products
          </Link>
        </Button>

        {/* Try Again Button (only for non-404 errors) */}
        {!isNotFound && (
          <Button onClick={reset} variant="outline" className="min-w-[140px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}

        {/* Back Button */}
        <Button asChild variant="ghost" className="min-w-[140px]">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
      </div>

      {/* Quick Navigation */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link
            href="/products"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <Search className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900">All Products</h4>
            <p className="text-sm text-gray-500 mt-1">Browse our catalog</p>
          </Link>

          <Link
            href="/cart"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <span className="text-white text-sm font-bold">🛒</span>
            </div>
            <h4 className="font-medium text-gray-900">Your Cart</h4>
            <p className="text-sm text-gray-500 mt-1">Review your items</p>
          </Link>

          <Link
            href="/"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <Home className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900">Homepage</h4>
            <p className="text-sm text-gray-500 mt-1">Start over</p>
          </Link>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 text-left bg-gray-50 p-4 rounded-lg">
          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
            Debug Information (Development Only)
          </summary>
          <pre className="text-xs text-gray-600 overflow-auto">
            {error.message}
            {error.stack && `\n\nStack trace:\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
}
