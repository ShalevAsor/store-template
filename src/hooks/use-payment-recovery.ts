import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  checkOrderPaymentStatus,
  markOrderAsFailed,
} from "@/lib/actions/orderActions";

interface UsePaymentRecoveryOptions {
  orderId: string | null;
  enabled: boolean; // Only start when payment error occurs
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

/**
 * Background payment recovery - checks if webhook completed payment
 * User sees normal processing state, no special recovery UI
 */
export function usePaymentRecovery({
  orderId,
  enabled,
  onSuccess,
  onFailure,
}: UsePaymentRecoveryOptions) {
  const router = useRouter();
  const attemptsRef = useRef(0);
  const maxAttempts = 20; // 40 seconds total

  // Reset attempts when starting new recovery
  useEffect(() => {
    if (enabled && orderId) {
      attemptsRef.current = 0;
      console.log(`Starting payment recovery for order ${orderId}`);
    }
  }, [enabled, orderId]);

  const { data: orderStatus } = useQuery({
    queryKey: ["orderPaymentRecovery", orderId],
    queryFn: () => checkOrderPaymentStatus(orderId!),
    enabled: enabled && !!orderId,
    refetchInterval: 2000, // Poll every 2 seconds
    retry: false,
  });

  // Handle recovery results
  useEffect(() => {
    if (!enabled || !orderStatus || !orderId) return;

    attemptsRef.current += 1;
    console.log(
      `Recovery attempt ${attemptsRef.current}/${maxAttempts} for order ${orderId}`
    );

    // Success - webhook completed the payment
    if (orderStatus.isCompleted) {
      console.log("✅ Payment recovery successful - webhook completed payment");
      onSuccess();
      return;
    }

    // Max attempts reached - genuine failure
    if (attemptsRef.current >= maxAttempts) {
      console.log("❌ Payment recovery failed - max attempts reached");

      // Mark order as failed in database
      markOrderAsFailed(orderId).then(() => {
        const errorMessage =
          orderStatus.paymentStatus === "FAILED"
            ? "Payment was declined. Please try again with a different payment method."
            : "Payment processing failed. Please try again or contact support if you believe this payment was processed.";

        onFailure(errorMessage);
      });
      return;
    }
  }, [orderStatus, enabled, orderId, onSuccess, onFailure, router]);

  return {
    isRecovering: enabled,
    currentAttempt: attemptsRef.current,
    maxAttempts,
  };
}
