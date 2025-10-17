import { PaymentError } from "@/services/payment/core/PaymentResult";

/**
 * Maps payment methods to their corresponding payment providers
 */
export function getPaymentProvider(paymentMethod: string): string {
  const methodToProvider: Record<string, string> = {
    paypal: "paypal",
    card: "stripe", // Future
    apple_pay: "stripe", // Future
    google_pay: "stripe", // Future
  };

  return methodToProvider[paymentMethod] || "paypal"; // fallback to paypal
}

/**
 * Convert payment service errors to user-friendly messages
 */
export function getPaymentErrorMessage(
  error: PaymentError | undefined
): string {
  if (!error) {
    return "Payment failed. Please try again.";
  }

  switch (error.code) {
    case "UNSUPPORTED_CURRENCY":
      return "This payment method doesn't support the selected currency. Please contact support.";

    case "PROVIDER_NOT_FOUND":
    case "CONFIGURATION_ERROR":
      return "Payment service is currently unavailable. Please try again later.";

    case "VALIDATION_ERROR":
      // These are usually safe to show to users
      return error.message;

    case "INSUFFICIENT_FUNDS":
      return "Insufficient funds. Please check your payment method.";

    case "PAYMENT_DECLINED":
      return "Payment was declined. Please try a different payment method.";

    case "EXPIRED_CARD":
      return "Payment method has expired. Please update your payment information.";

    case "AUTHENTICATION_FAILED":
      return "Payment authentication failed. Please try again.";

    case "RATE_LIMITED":
      return "Too many payment attempts. Please wait a moment and try again.";

    case "TIMEOUT":
    case "NETWORK_ERROR":
      return "Payment service is temporarily unavailable. Please try again.";

    case "UNEXPECTED_ERROR":
    case "UNKNOWN":
    default:
      return "Payment system error. Please try again or contact support.";
  }
}

/**
 * Helper to create payment error ActionResult
 */
export function createPaymentErrorResult(error: PaymentError | undefined) {
  return {
    success: false,
    error: getPaymentErrorMessage(error),
  };
}
