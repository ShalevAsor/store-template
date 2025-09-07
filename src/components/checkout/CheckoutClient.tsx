"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useHydration } from "@/hooks/use-hydration";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { processCheckout, CheckoutResult } from "@/lib/actions/checkoutAction";
import { calculateOrderTotals } from "@/utils/priceUtils";
import { toast } from "sonner";
import type { CheckoutFormData } from "@/schemas/checkoutSchema";
import { useModalStore } from "@/store/modalStore";

export function CheckoutClient() {
  const router = useRouter();
  const { items, clearCart, updateQuantity, removeItem } = useCartStore();
  const hasHydrated = useHydration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onOpen } = useModalStore();

  const handleFormSubmit = async (
    formData: CheckoutFormData
  ): Promise<CheckoutResult> => {
    setIsSubmitting(true);

    try {
      const result = await processCheckout(formData, items);

      // Handle stock issues - show modal for user confirmation
      if (result.needsConfirmation && result.stockIssues) {
        const originalTotals = calculateOrderTotals(items);

        onOpen("stockConfirmation", {
          stockConfirmation: {
            stockAdjustments: result.stockIssues,
            originalCartItems: items,
            originalTotal: originalTotals.total,
            adjustedTotal: result.adjustedTotal || 0,
            onConfirm: async () => {
              try {
                // Calculate adjusted items from stock adjustments
                const adjustedItems = items
                  .filter((item) => {
                    const adjustment = result.stockIssues?.find(
                      (adj) => adj.productId === item.id
                    );
                    return adjustment?.action !== "removed";
                  })
                  .map((item) => {
                    const adjustment = result.stockIssues?.find(
                      (adj) => adj.productId === item.id
                    );
                    if (adjustment?.action === "reduced") {
                      return {
                        ...item,
                        quantity: adjustment.availableQuantity,
                      };
                    }
                    return item;
                  });

                // Update cart store for UI consistency
                result.stockIssues?.forEach((adjustment) => {
                  if (adjustment.action === "removed") {
                    removeItem(adjustment.productId);
                  } else {
                    updateQuantity(
                      adjustment.productId,
                      adjustment.availableQuantity
                    );
                  }
                });

                // Retry checkout with confirmed flag and ADJUSTED items
                const confirmedResult = await processCheckout(
                  formData,
                  adjustedItems,
                  {
                    confirmed: true,
                  }
                );

                if (confirmedResult.success && confirmedResult.orderId) {
                  clearCart();
                  router.push(`/checkout/success/${confirmedResult.orderId}`);
                } else {
                  setIsSubmitting(false);
                  // Handle different types of errors
                  if (
                    confirmedResult.error?.includes("stock") ||
                    confirmedResult.error?.includes("Insufficient")
                  ) {
                    // Stock changed while processing - redirect to cart
                    toast.error(
                      "Items in your cart are no longer available. Please review your cart and try again."
                    );
                    router.push("/cart");
                  } else {
                    // Other errors - show generic message
                    toast.error(
                      confirmedResult.error ||
                        "Failed to process order. Please try again."
                    );
                  }
                }
              } catch (error) {
                console.error("Confirmed checkout error:", error);
                setIsSubmitting(false);

                // Handle caught errors (network issues, etc.)
                if (error instanceof Error && error.message.includes("stock")) {
                  toast.error(
                    "Items in your cart are no longer available. Please review your cart and try again."
                  );
                  router.push("/cart");
                } else {
                  toast.error("Failed to process order. Please try again.");
                }
              }
            },
            onCancel: () => {
              setIsSubmitting(false); // Reset loading state
            },
          },
        });

        // Don't reset loading state here - keep it active for modal interaction
        return result;
      }

      // Normal success case
      if (result.success && result.orderId) {
        clearCart();
        router.push(`/checkout/success/${result.orderId}`);
        return result;
      }

      // Reset submitting state on error
      setIsSubmitting(false);
      return result;
    } catch (error) {
      console.error("Checkout submission error:", error);
      setIsSubmitting(false);
      return {
        success: false,
        error: "Failed to process your order. Please try again.",
      };
    }
  };

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show empty state if cart is empty after hydration
  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
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

  // Show processing overlay during submission
  if (isSubmitting) {
    return (
      <div className="relative">
        {/* Dimmed checkout content */}
        <div className="opacity-50 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutForm cartItems={items} onSubmit={handleFormSubmit} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>

        {/* Processing overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Processing your order...
            </p>
            <p className="text-sm text-gray-600">
              {"Please don't close this page"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show normal checkout content
  return (
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
  );
}
