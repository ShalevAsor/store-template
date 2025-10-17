"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import {
  createPaymentOrder,
  capturePaymentOrder,
} from "@/lib/actions/paymentActions";

interface PayPalPaymentSectionProps {
  orderId: string;
  isVisible: boolean;
  onPaymentStart?: () => void;
  onPaymentComplete?: (orderId: string) => void;
  onPaymentError?: (error: string) => void;
}

export function PayPalPaymentSection({
  orderId,
  isVisible,
  onPaymentStart,
  onPaymentComplete,
  onPaymentError,
}: PayPalPaymentSectionProps) {
  // Separate loading states for different operations
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);

  // PayPal configuration
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
    intent: "capture" as const,
    components: "buttons,funding-eligibility",
  };

  /**
   * Create PayPal order when user clicks payment button
   * This should NOT trigger the main processing state
   */
  const handleCreatePayPalOrder = async (): Promise<string> => {
    try {
      setIsCreatingOrder(true); // Only set local loading state

      console.log("Creating payment order for:", orderId);

      const result = await createPaymentOrder(orderId);

      if (!result.success) {
        const errorMessage = result.error || "Failed to create payment order";
        onPaymentError?.(errorMessage);
        return "";
      }

      console.log("Payment order created:", result.data?.providerPaymentId);
      return result.data?.providerPaymentId || "";
    } catch (error) {
      console.error("Failed to create payment order:", error);
      const errorMessage = "Failed to create payment order. Please try again.";
      onPaymentError?.(errorMessage);
      return "";
    } finally {
      setIsCreatingOrder(false);
    }
  };

  /**
   * Process payment when user approves PayPal order
   * This is when we should trigger the main processing state
   */
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    try {
      setIsCapturingPayment(true);

      // NOW trigger the main processing state since user has approved
      onPaymentStart?.();

      console.log("Capturing payment:", data.orderID);

      const result = await capturePaymentOrder(orderId, data.orderID);

      if (!result.success) {
        const errorMessage = result.error || "Payment processing failed";
        onPaymentError?.(errorMessage);
        return;
      }

      // Success!
      // toast.success("Payment successful! Redirecting...");
      onPaymentComplete?.(orderId);

      // Redirect to success page
      // router.push(`/checkout/success/${orderId}`);
    } catch (error) {
      console.error("Payment capture failed:", error);
      const errorMessage = "Payment processing failed. Please try again.";

      onPaymentError?.(errorMessage);
    } finally {
      setIsCapturingPayment(false);
    }
  };

  /**
   * Handle PayPal errors
   */
  const handlePayPalError = (error: unknown) => {
    console.error("PayPal error:", error);
    const errorMessage = "PayPal encountered an error. Please try again.";
    onPaymentError?.(errorMessage);
    setIsCreatingOrder(false);
    setIsCapturingPayment(false);
  };

  /**
   * Handle user cancellation
   */
  const handleCancel = () => {
    console.log("PayPal payment cancelled by user");
    toast.info("Payment cancelled");
    setIsCreatingOrder(false);
    setIsCapturingPayment(false);
  };
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  // Check PayPal configuration
  if (!paypalOptions.clientId) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-700 text-sm font-medium">
              PayPal Configuration Error
            </p>
            <p className="text-red-600 text-xs">
              PayPal is not configured. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }
  const isAnyLoading = isCreatingOrder || isCapturingPayment;

  return (
    <div className="space-y-4">
      {/* Local loading state for order creation */}
      {isCreatingOrder && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
          <span className="text-blue-700 font-medium">
            Setting up PayPal payment...
          </span>
        </div>
      )}

      {/* PayPal capture processing state */}
      {isCapturingPayment && (
        <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <Loader2 className="w-5 h-5 mr-2 animate-spin text-green-600" />
          <span className="text-green-700 font-medium">
            Processing your payment...
          </span>
        </div>
      )}

      {/* PayPal Buttons */}
      <div className={isAnyLoading ? "opacity-50 pointer-events-none" : ""}>
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            createOrder={handleCreatePayPalOrder}
            onApprove={handleApprovePayPalOrder}
            onError={handlePayPalError}
            onCancel={handleCancel}
            disabled={isAnyLoading}
            style={{
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "pay",
              height: 45,
            }}
            forceReRender={[paypalOptions.clientId, orderId]}
          />
        </PayPalScriptProvider>
      </div>

      {/* Payment info */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Secure payment powered by PayPal</p>
        <p>You&apos;ll be redirected to PayPal to complete your payment</p>
      </div>
    </div>
  );
}
