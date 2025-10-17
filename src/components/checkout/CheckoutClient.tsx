"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useHydration } from "@/hooks/use-hydration";
import { useCheckoutState } from "@/hooks/use-checkout-state";
import { usePaymentRecovery } from "@/hooks/use-payment-recovery";
import { useModalStore } from "@/store/modalStore";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { processCheckout } from "@/lib/actions/checkoutAction";
import { calculateOrderTotals } from "@/utils/orderUtils";
import { toast } from "sonner";
import type { CheckoutFormData } from "@/schemas/checkoutSchema";
import { PaymentSection } from "../payment/PaymentSection";

export function CheckoutClient() {
  const router = useRouter();
  // manage cart state
  const { items, clearCart, updateQuantity, removeItem } = useCartStore();
  // for stock confirmation modal
  const { onOpen } = useModalStore();
  const hasHydrated = useHydration();
  // manage checkout state
  const { state, actions, isForm, isPayment, isProcessing, isError, hasOrder } =
    useCheckoutState();

  // payment recovery hook - runs in background when payment fails
  usePaymentRecovery({
    orderId: state.orderId,
    enabled: state.needsRecovery && !!state.orderId, // only when processing with orderId
    onSuccess: () => {
      // recovery successful - webhook completed payment
      actions.stopRecovery();
      handlePaymentComplete(state.orderId!);
    },
    onFailure: (error: string) => {
      // Genuine failure after recovery attempts
      actions.stopRecovery();
      actions.setError(error, true);
      toast.error(error);
    },
  });

  // Handle form submission
  const handleFormSubmit = async (formData: CheckoutFormData) => {
    actions.startOrderCreation();
    try {
      const result = await processCheckout(formData, items);
      if (result.success && result.data?.orderId) {
        actions.orderCreated(result.data.orderId, formData.paymentMethod);
        toast.success("Order created! Please complete payment.");
        return;
      }
      // Handle stock confirmation if needed
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
                // update cart store for UI consistency
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
                // Retry checkout with confirmed flag and adjusted items
                const confirmResult = await processCheckout(
                  formData,
                  adjustedItems,
                  { confirmed: true }
                );
                if (confirmResult.success && confirmResult.data?.orderId) {
                  actions.orderCreated(
                    confirmResult.data.orderId,
                    formData.paymentMethod
                  );
                  toast.success("Order created! Please complete payment.");
                } else {
                  actions.setError(
                    confirmResult.error ||
                      "Failed to process order. Please try again.",
                    true
                  );
                }
              } catch (error) {
                console.error("Confirmed checkout error:", error);
                actions.setError(
                  "Failed to process order. Please try again.",
                  true
                );
              }
            },
            onCancel: () => {
              actions.resetError(); // Reset to form state
            },
          },
        });
        // Don't proceed further - wait for user confirmation
        return;
      }
      // Handle validation errors
      if (!result.success && result.fieldErrors) {
        console.log(
          "🔴 Server validation errors received:",
          result.fieldErrors
        );
        actions.resetError();

        // Format field names for better readability
        const formatFieldName = (field: string) => {
          const fieldMap: Record<string, string> = {
            customerName: "Name",
            customerEmail: "Email",
            customerPhone: "Phone",
            "shippingAddress.line1": "Street Address",
            "shippingAddress.city": "City",
            "shippingAddress.postalCode": "Postal Code",
            "shippingAddress.country": "Country",
          };
          return fieldMap[field] || field;
        };

        // Show errors in toast
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          toast.error(`${formatFieldName(field)}: ${messages[0]}`);
        });
        // Show general error :
        if (result.error) {
          toast.error(result.error);
        }
        return;
      }
      // Handle other errors
      actions.setError(
        result.error || "Failed to process order. Please try again.",
        true
      );
    } catch (error) {
      console.error("Checkout submission error:", error);
      actions.setError("Failed to process your order. Please try again.", true);
    }
  };
  // Handle payment completion
  const handlePaymentComplete = (orderId: string) => {
    toast.success("Payment successful! Redirecting...");
    actions.paymentCompleted();
    clearCart();
    router.push(`/checkout/success/${orderId}`);
  };
  // Handle payment start
  const handlePaymentStart = () => {
    actions.paymentProcessing();
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    if (state.orderId) {
      console.log(
        "Payment capture failed, recovery will start automatically...",
        error
      );
      // start recovery state
      actions.startRecovery();
    } else {
      // No order ID means genuine error before payment started
      actions.setError(error, true);
      toast.error(error);
    }
  };

  // Handle retry from error state
  const handleRetry = () => {
    actions.resetError();
  };

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show empty state if cart is empty
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
  // Show error state
  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorMessage
            message={state.error || "Something went wrong"}
            variant="error"
            onRetry={state.canRetry ? handleRetry : undefined}
            onDismiss={handleRetry}
          />
        </div>
      </div>
    );
  }

  // Show processing overlay
  if (isProcessing) {
    return (
      <div className="relative">
        {/* Dimmed content */}
        <div className="opacity-50 pointer-events-none">
          <CheckoutLayout />
        </div>

        {/* Processing overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="flex flex-col justify-center items-center ">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Processing payment...
            </p>
            <p className="text-sm text-gray-600">
              Please do&apos;'t close this page
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Show main checkout content
  return <CheckoutLayout />;

  // Layout component to avoid duplication
  function CheckoutLayout() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {isForm && (
            <CheckoutForm
              cartItems={items}
              onSubmit={handleFormSubmit}
              isLoading={state.isLoading}
            />
          )}

          {isPayment && hasOrder && (
            <div className="space-y-6">
              {/* Success message */}
              <div className="p-6 border rounded-lg bg-green-50 border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Order Created Successfully!
                </h3>
                <p className="text-green-700 text-sm">
                  Complete your payment below to finalize your order.
                </p>
              </div>

              {/* Payment Section */}
              <PaymentSection
                orderId={state.orderId!}
                paymentMethod={state.paymentMethod!}
                onPaymentStart={handlePaymentStart}
                onPaymentComplete={handlePaymentComplete}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <OrderSummary />
          </div>
        </div>
      </div>
    );
  }
}
