// src/services/payment/core/PaymentConfig.ts

/**
 * Base configuration interface for payment providers
 */

import { PaymentStatus } from "@prisma/client"; // Import from Prisma instead of defining our own

export interface PaymentProviderConfig {
  /**
   * Environment: sandbox/production
   */
  environment: "sandbox" | "production";

  /**
   * Provider-specific credentials
   */
  credentials: Record<string, string>;

  /**
   * Default currency for this provider
   */
  defaultCurrency: string;

  /**
   * Webhook configuration
   */
  webhook?: {
    url: string;
    secret: string;
  };

  /**
   * Retry configuration
   */
  retry?: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };

  /**
   * Provider-specific options
   */
  options?: Record<string, unknown>;
}

// Supporting Types

/**
 * Structured address format
 */

export interface PaymentAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2 country code
}

/**
 * customer information type
 */
export interface PaymentCustomer {
  name: string;
  email: string;
  phone?: string;
}
/**
 * Reusable payer information type
 */
export interface PaymentPayerInfo {
  email: string;
  name?: string;
  payerId?: string;
}

export interface PaymentItem {
  name: string;
  quantity: number;
  price: number; // In minor units
}

/**
 * Reusable payment metadata type
 */
export interface PaymentMetadata {
  isDigital: boolean;
  items?: PaymentItem[];
  [key: string]: unknown;
}

/**
 *Reusable return URLs type
 */
export interface PaymentReturnUrls {
  success: string;
  cancel: string;
  error?: string;
}
/**
 * Refund statuses (keep this separate as it's not in your current Prisma schema)
 */
export enum RefundStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

/**
 * Request to create a payment
 */
export interface CreatePaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number; // Amount in minor units (e.g. cents)
  currency: string;
  description?: string;

  // Customer information
  customer: PaymentCustomer;

  // Billing address
  billingAddress?: PaymentAddress;

  // Shipping address for physical products
  shippingAddress?: PaymentAddress;

  // Order metadata
  metadata?: PaymentMetadata;

  // Return URLs for redirect-based flows
  returnUrls?: PaymentReturnUrls;
}

/**
 * Response from creating a payment
 */
export interface CreatePaymentResponse {
  /**
   * Provider id used for create this payment
   */
  providerId: string;
  /**
   * Provider's payment ID (e.g., PayPal order ID)
   */
  providerPaymentId: string;

  /**
   * Payment status using Prisma enum
   */
  status: PaymentStatus;

  /**
   * Approval/redirect URL for user interaction (if needed)
   */
  approvalUrl?: string;

  /**
   * Client token for frontend SDK (if applicable)
   */
  clientToken?: string;

  /**
   * Provider-specific data
   */
  providerData?: Record<string, unknown>;
}

/**
 * Request to capture a payment
 */
export interface CapturePaymentRequest {
  orderId: string;
  providerPaymentId: string;
  amount?: number; // Optional for partial captures (in minor units)
}

/**
 * Response from capturing a payment
 */
export interface CapturePaymentResponse {
  transactionId: string;
  status: PaymentStatus;
  amountCaptured: number; // In minor units
  fees?: number; // Provider fees in cents
  payerInfo?: PaymentPayerInfo;
  providerData?: Record<string, unknown>;
}

/**
 * Payment status response
 */
export interface PaymentStatusResponse {
  status: PaymentStatus;
  transactionId?: string;
  amountPaid?: number; // In minor units
  lastUpdated: Date;
  providerData?: Record<string, unknown>;
}

/**
 * Refund request
 */
export interface RefundPaymentRequest {
  transactionId: string;
  currency: string;
  amount?: number; // Optional for partial refunds
  reason?: string;
}
/**
 * Refund response
 */
export interface RefundPaymentResponse {
  refundId: string;
  status: RefundStatus;
  amountRefunded: number; // In minor units
  refundedAt: Date;
}

/**
 * Webhook event data
 */
export interface WebhookEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  paymentId: string;
  orderId?: string;
  data: unknown;
}

/**
 * Webhook processing result
 */
export interface WebhookResult {
  processed: boolean;
  event: WebhookEvent | null;
  shouldUpdateOrder: boolean;
  orderUpdate?: {
    orderId: string;
    status: PaymentStatus;
    transactionId?: string;
    failureReason?: string;
    paidAmount?: number;
    payerEmail?: string;
  };
}
