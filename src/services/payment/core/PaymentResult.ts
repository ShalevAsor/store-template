/**
 * Standardized result wrapper for all payment operations
 * Provides consistent error handling and success responses
 */
export interface PaymentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: PaymentError;
  metadata?: Record<string, unknown>;
}

/**
 * Standardized error structure across all payment providers
 */
export interface PaymentError {
  code: string;
  message: string;
  type: PaymentErrorType;
  retryable: boolean;
  providerError?: unknown; // Original error from provider
}

export enum PaymentErrorType {
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  PROVIDER_ERROR = "PROVIDER_ERROR",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  PAYMENT_DECLINED = "PAYMENT_DECLINED",
  EXPIRED_CARD = "EXPIRED_CARD",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  RATE_LIMITED = "RATE_LIMITED",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}
