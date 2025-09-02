"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { processCheckout, CheckoutResult } from "@/lib/actions/checkoutAction";
import type { CheckoutFormData } from "@/schemas/checkoutSchema";
import { useHydration } from "@/hooks/use-hydration";
import { StockWarning } from "@/components/checkout/StockWarning";

type PageState = "loading" | "ready" | "submitting";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const hasHydrated = useHydration();
  const [pageState, setPageState] = useState<PageState>("loading");

  // Set page to ready once hydration completes
  useEffect(() => {
    if (hasHydrated) {
      setPageState("ready");
    }
  }, [hasHydrated]);

  const handleFormSubmit = async (
    formData: CheckoutFormData
  ): Promise<CheckoutResult> => {
    setPageState("submitting");

    try {
      const result = await processCheckout(formData, items);

      if (result.success && result.orderId) {
        clearCart();
        // Navigate to success page
        router.push(`/checkout/success/${result.orderId}`);
        return result;
      }

      // Reset to ready state on error
      setPageState("ready");
      return result;
    } catch (error) {
      console.error("Checkout submission error:", error);
      setPageState("ready");
      return {
        success: false,
        error: "Failed to process your order. Please try again.",
      };
    }
  };

  const breadcrumbItems = [
    { label: "Cart", href: "/cart" },
    { label: "Checkout" },
  ];

  // Show loading while hydrating
  if (pageState === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  // Show empty state if cart is empty after hydration
  if (pageState === "ready" && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          variant="cart"
          title="Your cart is empty"
          description="Add some products before proceeding to checkout"
          actionLabel="Continue Shopping"
          onAction={() => router.push("/products")}
        />
      </div>
    );
  }

  // Show processing state during submission
  if (pageState === "submitting") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Processing your order..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">
          Review your order and complete your purchase
        </p>
      </div>

        <StockWarning />
      

      {/* Checkout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <CheckoutForm cartItems={items} onSubmit={handleFormSubmit} />
        </div>

        {/* Order Summary - Takes up 1 column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <OrderSummary />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Secure Checkout
            </h3>
            <p className="text-sm text-gray-600">
              Your payment information is encrypted and secure. We never store
              your payment details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
