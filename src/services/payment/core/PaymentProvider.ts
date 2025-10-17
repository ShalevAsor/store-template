/**
 * Core payment provider interface that all payment providers must implement
 * This ensures consistent behavior across different payment gateways
 */

import {
  CapturePaymentRequest,
  CapturePaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentProviderConfig,
  PaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  WebhookResult,
} from "./PaymentConfig";
import { PaymentResult } from "./PaymentResult";

export interface PaymentProvider {
  /**
   * Unique identifier for this payment provider (e.g., 'paypal', 'stripe')
   */
  readonly providerId: string;

  /**
   * Human-readable name for this provider
   */
  readonly providerName: string;

  /**
   * Supported currencies by this provider
   */
  readonly supportedCurrencies: string[];

  /**
   * Initialize the provider with configuration
   */
  initialize(config: PaymentProviderConfig): Promise<void>;

  /**
   * Create a payment order/session
   * This is step 1 of the payment flow - creates the payment intent
   */
  createPayment(
    request: CreatePaymentRequest
  ): Promise<PaymentResult<CreatePaymentResponse>>;

  /**
   * Capture/complete a payment
   * This is step 2 - actually processes the payment after user approval
   */
  capturePayment(
    request: CapturePaymentRequest
  ): Promise<PaymentResult<CapturePaymentResponse>>;

  /**
   * Get payment status from provider
   * Used for polling or verification
   */
  getPaymentStatus(
    paymentId: string
  ): Promise<PaymentResult<PaymentStatusResponse>>;

  /**
   * Process webhook from provider
   * Handles async payment updates
   */
  processWebhook(payload: unknown, signature?: string): Promise<WebhookResult>;

  /**
   * Optional: Refund a payment
   */
  refundPayment?(
    request: RefundPaymentRequest
  ): Promise<PaymentResult<RefundPaymentResponse>>;
}
