// src/services/payment/PaymentService.ts

import { PaymentProvider } from "./core/PaymentProvider";
import {
  PaymentProviderConfig,
  CreatePaymentRequest,
  CreatePaymentResponse,
  CapturePaymentRequest,
  CapturePaymentResponse,
  PaymentStatusResponse,
  PaymentAddress,
  PaymentCustomer,
  PaymentMetadata,
  WebhookResult,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from "./core/PaymentConfig";
import { PaymentResult, PaymentErrorType } from "./core/PaymentResult";
import { paymentProviderFactory } from "./factories/PaymentProviderFactory";

/**
 * Service request type that extends the base CreatePaymentRequest
 * but removes fields that the service will generate automatically
 */
export interface CreatePaymentServiceRequest
  extends Omit<CreatePaymentRequest, "returnUrls" | "billingAddress"> {
  providerId?: string; // Only unique field - which provider to use
}

/**
 * Request type for capturing payment
 */
export interface CapturePaymentServiceRequest {
  orderId: string;
  providerPaymentId: string;
  providerId?: string;
}

/**
 * Request type for refund payment
 */

export interface RefundPaymentServiceRequest {
  transactionId: string;
  currency: string;
  amount?: number;
  reason?: string;
  providerId?: string;
}

/**
 * Configuration for the payment service
 */
export interface PaymentServiceConfig {
  providers: Record<string, PaymentProviderConfig>;
  defaultProvider: string;
  baseUrl: string;
}

/**
 * Main Payment Service - Orchestrates payment operations across providers
 * This is the main entry point for all payment operations in your application
 */
export class PaymentService {
  private config: PaymentServiceConfig;
  private providers = new Map<string, PaymentProvider>();

  constructor(config: PaymentServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize all configured payment providers
   */
  async initialize(): Promise<void> {
    console.log(
      "Initializing payment service with providers:",
      Object.keys(this.config.providers)
    );

    const initPromises = Object.entries(this.config.providers).map(
      async ([providerId, providerConfig]) => {
        try {
          const provider = await paymentProviderFactory.createProvider(
            providerId,
            providerConfig
          );
          this.providers.set(providerId, provider);
          console.log(
            `Payment provider '${providerId}' initialized successfully`
          );
          return { success: true, providerId };
        } catch (error) {
          console.error(
            `Failed to initialize payment provider '${providerId}':`,
            error
          );
          return { success: false, providerId, error };
        }
      }
    );

    const results = await Promise.all(initPromises);
    const failures = results.filter((r) => !r.success);

    if (failures.length > 0) {
      const failedProviders = failures.map((f) => f.providerId).join(", ");
      throw new Error(
        `Payment service initialization failed for providers: ${failedProviders}`
      );
    }

    if (!this.providers.has(this.config.defaultProvider)) {
      throw new Error(
        `Default payment provider '${this.config.defaultProvider}' is not configured`
      );
    }

    console.log(
      `Payment service initialized with ${this.providers.size} providers`
    );
  }

  /**
   * Create a payment using the specified provider
   */
  async createPayment(
    request: CreatePaymentServiceRequest
  ): Promise<PaymentResult<CreatePaymentResponse>> {
    // Input validation
    const validationError = this.validateCreatePaymentRequest(request);
    if (validationError) {
      return validationError;
    }
    // Select provider based on request or fallback to default provider
    let providerId = request.providerId || this.config.defaultProvider;
    // if no provider specified , find best one for currency
    if (!request.providerId) {
      const bestProvider = this.getBestProviderForCurrency(request.currency);
      if (bestProvider) {
        providerId = bestProvider;
        console.log(
          `Auto-selected provider '${providerId}' for currency '${request.currency}'`
        );
      }
    }

    const provider = this.providers.get(providerId);

    if (!provider) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.CONFIGURATION_ERROR,
          message: `Payment provider '${providerId}' not found or not initialized`,
          code: "PROVIDER_NOT_FOUND",
          retryable: false,
        },
      };
    }

    // Validate currency support
    if (!provider.supportedCurrencies.includes(request.currency)) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.VALIDATION_ERROR,
          message: `Provider '${
            provider.providerName
          }' doesn't support currency '${
            request.currency
          }'. Supported currencies: ${provider.supportedCurrencies.join(", ")}`,
          code: "UNSUPPORTED_CURRENCY",
          retryable: false,
        },
      };
    }

    // Transform service request to provider request by adding auto-generated fields
    const paymentRequest: CreatePaymentRequest = {
      ...request,
      // Auto-generate return URLs based on order ID
      returnUrls: {
        success: `${this.config.baseUrl}/checkout/success/${request.orderId}`,
        cancel: `${this.config.baseUrl}/checkout`,
        error: `${this.config.baseUrl}/checkout/error/${request.orderId}`,
      },
      // We don't currently collect billing address, but could add it here if needed
    };

    console.log(`Creating payment with ${provider.providerName}:`, {
      orderId: request.orderId,
      orderNumber: request.orderNumber,
      amount: `${request.amount} minor units`,
      currency: request.currency,
      providerId,
    });
    try {
      const result = await provider.createPayment(paymentRequest);
      if (result.success) {
        console.log(
          `Payment created successfully with ${provider.providerName}:`,
          {
            orderId: request.orderId,
            providerPaymentId: result.data?.providerPaymentId,
            status: result.data?.status,
          }
        );
      } else {
        console.error(
          `Payment creation failed with ${provider.providerName}:`,
          result.error
        );
      }
      return result;
    } catch (error) {
      console.error(
        `Unexpected error creating payment with ${provider.providerName}:`,
        error
      );
      return {
        success: false,
        error: {
          type: PaymentErrorType.UNKNOWN,
          message: `Unexpected error during payment creation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          code: "UNEXPECTED_ERROR",
          retryable: true,
        },
      };
    }
  }
  /**
   * Capture a payment after user approval
   */
  async capturePayment(
    request: CapturePaymentServiceRequest
  ): Promise<PaymentResult<CapturePaymentResponse>> {
    // Input validation
    const validationError = this.validateCapturePaymentRequest(request);
    if (validationError) {
      return validationError;
    }

    // Select provider (use provided or fallback to default)
    const activeProviderId = request.providerId || this.config.defaultProvider;
    const provider = this.providers.get(activeProviderId);

    if (!provider) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.CONFIGURATION_ERROR,
          message: `Payment provider '${activeProviderId}' not found or not initialized`,
          code: "PROVIDER_NOT_FOUND",
          retryable: false,
        },
      };
    }

    console.log(`Capturing payment with ${provider.providerName}:`, {
      orderId: request.orderId,
      providerPaymentId: request.providerPaymentId,
    });

    // Create capture request for provider
    const captureRequest: CapturePaymentRequest = {
      orderId: request.orderId,
      providerPaymentId: request.providerPaymentId,
    };

    try {
      const result = await provider.capturePayment(captureRequest);

      if (result.success) {
        console.log(
          `Payment captured successfully with ${provider.providerName}:`,
          {
            orderId: request.orderId,
            transactionId: result.data?.transactionId,
            amountCaptured: result.data?.amountCaptured,
          }
        );
      } else {
        console.error(
          `Payment capture failed with ${provider.providerName}:`,
          result.error
        );
      }

      return result;
    } catch (error) {
      console.error(
        `Unexpected error capturing payment with ${provider.providerName}:`,
        error
      );
      return {
        success: false,
        error: {
          type: PaymentErrorType.UNKNOWN,
          message: `Unexpected error during payment capture: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          code: "UNEXPECTED_ERROR",
          retryable: true,
        },
      };
    }
  }
  /**
   * Process webhook from payment provider
   */
  async processWebhook(
    providerId: string,
    payload: unknown,
    signature?: string
  ): Promise<WebhookResult> {
    const provider = this.providers.get(providerId);

    if (!provider) {
      console.error(`Payment provider '${providerId}' not found for webhook`);
      return {
        processed: false,
        event: null,
        shouldUpdateOrder: false,
      };
    }

    console.log(`Processing webhook with ${provider.providerName}`);
    return await provider.processWebhook(payload, signature);
  }

  /**
   * Get payment status from provider
   */
  async getPaymentStatus(
    providerPaymentId: string,
    providerId?: string
  ): Promise<PaymentResult<PaymentStatusResponse>> {
    const activeProviderId = providerId || this.config.defaultProvider;
    const provider = this.providers.get(activeProviderId);

    if (!provider) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.CONFIGURATION_ERROR,
          message: `Payment provider '${activeProviderId}' not found or not initialized`,
          code: "PROVIDER_NOT_FOUND",
          retryable: false,
        },
      };
    }

    return await provider.getPaymentStatus(providerPaymentId);
  }

  /**
   * Get information about available payment providers
   */
  getAvailableProviders(): Array<{
    id: string;
    name: string;
    supportedCurrencies: string[];
  }> {
    return Array.from(this.providers.values()).map((provider) => ({
      id: provider.providerId,
      name: provider.providerName,
      supportedCurrencies: provider.supportedCurrencies,
    }));
  }

  /**
   * Check if a provider supports a specific currency
   */
  providerSupportsCurrency(providerId: string, currency: string): boolean {
    const provider = this.providers.get(providerId);
    return provider ? provider.supportedCurrencies.includes(currency) : false;
  }

  /**
   * Get the best provider for a specific currency
   */
  getBestProviderForCurrency(currency: string): string | null {
    for (const [providerId, provider] of this.providers.entries()) {
      if (provider.supportedCurrencies.includes(currency)) {
        return providerId;
      }
    }
    return null;
  }
  /**
   * Process a refund for a captured payment
   */
  // async refundPayment(
  //   transactionId: string,
  //   amount?: number,
  //   reason?: string,
  //   providerId?: string
  // ): Promise<PaymentResult<RefundPaymentResponse>> {
  //   const activeProviderId = providerId || this.config.defaultProvider;
  //   const provider = this.providers.get(activeProviderId);

  //   if (!provider) {
  //     return {
  //       success: false,
  //       error: {
  //         type: PaymentErrorType.CONFIGURATION_ERROR,
  //         message: `Payment provider '${activeProviderId}' not found or not initialized`,
  //         code: "PROVIDER_NOT_FOUND",
  //         retryable: false,
  //       },
  //     };
  //   }

  //   // Check if provider supports refunds
  //   if (!provider.refundPayment) {
  //     return {
  //       success: false,
  //       error: {
  //         type: PaymentErrorType.CONFIGURATION_ERROR,
  //         message: `Payment provider '${activeProviderId}' does not support refunds`,
  //         code: "REFUND_NOT_SUPPORTED",
  //         retryable: false,
  //       },
  //     };
  //   }

  //   console.log(`Processing refund with ${provider.providerName}:`, {
  //     transactionId,
  //     amount: amount ? `${amount} minor units` : "full refund",
  //     reason,
  //   });

  //   const refundRequest: RefundPaymentRequest = {
  //     transactionId,
  //     amount,
  //     reason,
  //   };

  //   return await provider.refundPayment(refundRequest);
  // }
  async refundPayment(
    request: RefundPaymentServiceRequest
  ): Promise<PaymentResult<RefundPaymentResponse>> {
    // Input validation
    const validationError = this.validateRefundPaymentRequest(request);
    if (validationError) {
      return validationError;
    }
    // Select provider (use provided or fallback to default)
    const activeProviderId = request.providerId || this.config.defaultProvider;
    const provider = this.providers.get(activeProviderId);

    if (!provider) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.CONFIGURATION_ERROR,
          message: `Payment provider '${activeProviderId}' not found or not initialized`,
          code: "PROVIDER_NOT_FOUND",
          retryable: false,
        },
      };
    }

    // Check if provider supports refunds
    if (!provider.refundPayment) {
      return {
        success: false,
        error: {
          type: PaymentErrorType.CONFIGURATION_ERROR,
          message: `Payment provider '${provider.providerName}' does not support refunds`,
          code: "REFUND_NOT_SUPPORTED",
          retryable: false,
        },
      };
    }

    console.log(`Processing refund with ${provider.providerName}:`, {
      transactionId: request.transactionId,
      amount: request.amount ? `${request.amount} minor units` : "full refund",
      currency: request.currency,
      reason: request.reason,
    });

    // Create refund request for provider
    const refundRequest: RefundPaymentRequest = {
      transactionId: request.transactionId,
      amount: request.amount,
      reason: request.reason,
      currency: request.currency,
    };
    try {
      const result = await provider.refundPayment(refundRequest);

      if (result.success) {
        console.log(
          `Refund processed successfully with ${provider.providerName}:`,
          {
            transactionId: request.transactionId,
            refundId: result.data?.refundId,
            amountRefunded: result.data?.amountRefunded,
            status: result.data?.status,
          }
        );
      } else {
        console.error(
          `Refund processing failed with ${provider.providerName}:`,
          result.error
        );
      }

      return result;
    } catch (error) {
      console.error(
        `Unexpected error processing refund with ${provider.providerName}:`,
        error
      );
      return {
        success: false,
        error: {
          type: PaymentErrorType.UNKNOWN,
          message: `Unexpected error during refund processing: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          code: "UNEXPECTED_ERROR",
          retryable: true,
        },
      };
    }
  }
  /**
   * Helper to create validation error results
   */
  private createValidationError(message: string): PaymentResult<never> {
    return {
      success: false,
      error: {
        type: PaymentErrorType.VALIDATION_ERROR,
        message,
        code: "VALIDATION_ERROR",
        retryable: false,
      },
    };
  }
  /**
   * Validate create payment request
   */
  private validateCreatePaymentRequest(
    request: CreatePaymentServiceRequest
  ): PaymentResult<never> | null {
    // Required fields validation
    if (!request.orderId?.trim()) {
      return this.createValidationError("Order ID is required");
    }

    if (!request.orderNumber?.trim()) {
      return this.createValidationError("Order number is required");
    }

    if (!request.amount || request.amount <= 0) {
      return this.createValidationError("Amount must be greater than 0");
    }

    if (!request.currency?.trim()) {
      return this.createValidationError("Currency is required");
    }

    // Customer validation
    if (!request.customer) {
      return this.createValidationError("Customer information is required");
    }

    if (!request.customer.name?.trim()) {
      return this.createValidationError("Customer name is required");
    }

    if (!request.customer.email?.trim()) {
      return this.createValidationError("Customer email is required");
    }

    // Provider validation (if specified)
    if (request.providerId && !this.providers.has(request.providerId)) {
      return this.createValidationError(
        `Specified provider '${
          request.providerId
        }' is not available. Available providers: ${Array.from(
          this.providers.keys()
        ).join(", ")}`
      );
    }

    return null; // No validation errors
  }
  /**
   * Validate create payment request
   */
  private validateCapturePaymentRequest(
    request: CapturePaymentServiceRequest
  ): PaymentResult<never> | null {
    // Required fields validation
    if (!request.orderId?.trim()) {
      return this.createValidationError("Order ID is required");
    }
    if (!request.providerPaymentId?.trim()) {
      return this.createValidationError("provider payment ID is required");
    }
    // Provider validation (if specified)
    if (request.providerId && !this.providers.has(request.providerId)) {
      return this.createValidationError(
        `Specified provider '${
          request.providerId
        }' is not available. Available providers: ${Array.from(
          this.providers.keys()
        ).join(", ")}`
      );
    }

    return null; // No validation errors
  }
  /**
   * Validate refund payment request
   */
  private validateRefundPaymentRequest(
    request: RefundPaymentServiceRequest
  ): PaymentResult<never> | null {
    // Required fields validation
    if (!request.transactionId?.trim()) {
      return this.createValidationError("Transaction ID is required");
    }
    if (!request.currency?.trim()) {
      return this.createValidationError("Currency is required");
    }

    // Amount validation (if provided)
    if (request.amount && request.amount <= 0) {
      return this.createValidationError("Amount must be greater than 0");
    }
    // Provider validation (if specified)
    if (request.providerId && !this.providers.has(request.providerId)) {
      return this.createValidationError(
        `Specified provider '${
          request.providerId
        }' is not available. Available providers: ${Array.from(
          this.providers.keys()
        ).join(", ")}`
      );
    }

    return null; // No validation errors
  }
}

/**
 * Create a configured payment service instance
 */

export function createPaymentService(): PaymentService {
  const config: PaymentServiceConfig = {
    providers: {
      paypal: {
        environment:
          process.env.NODE_ENV === "production" ? "production" : "sandbox",
        credentials: {
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
          clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
        },
        defaultCurrency: "USD",
        webhook: {
          url: `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/webhooks/paypal`,
          secret: process.env.PAYPAL_WEBHOOK_SECRET || "",
        },
        retry: {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
        },
      },
    },
    defaultProvider: "paypal",
    baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  };

  return new PaymentService(config);
}

/**
 * Singleton instance management
 */
let paymentServiceInstance: PaymentService | null = null;

export async function getPaymentService(): Promise<PaymentService> {
  if (!paymentServiceInstance) {
    paymentServiceInstance = createPaymentService();
    await paymentServiceInstance.initialize();
  }
  return paymentServiceInstance;
}
