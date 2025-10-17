// src/services/payment/providers/PayPalProvider.ts

import { PaymentProvider } from "../core/PaymentProvider";
import {
  PaymentProviderConfig,
  CreatePaymentRequest,
  CreatePaymentResponse,
  CapturePaymentRequest,
  CapturePaymentResponse,
  PaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  WebhookResult,
  PaymentAddress,
  PaymentPayerInfo,
  RefundStatus,
} from "../core/PaymentConfig";
import {
  PaymentResult,
  PaymentError,
  PaymentErrorType,
} from "../core/PaymentResult";
import { PaymentStatus } from "@prisma/client";
import {
  minorToMajorUnit,
  majorUnitToMinor,
  isSupportedCurrency,
} from "../../../utils/currencyUtils";

// ==================== PAYPAL SPECIFIC TYPES AND INTERFACES ====================

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer: {
    email_address: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units: Array<{
    reference_id?: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        create_time: string;
      }>;
    };
  }>;
}

interface PayPalPurchaseUnit {
  reference_id: string;
  description: string;
  custom_id: string;
  amount: {
    currency_code: string;
    value: string;
  };
  shipping?: PayPalShipping;
}

interface PayPalShipping {
  name: {
    full_name: string;
  };
  address: {
    address_line_1: string;
    address_line_2?: string;
    admin_area_2: string; // city
    admin_area_1?: string; // state
    postal_code: string;
    country_code: string;
  };
}

interface PayPalExperienceContext {
  shipping_preference: "NO_SHIPPING" | "SET_PROVIDED_ADDRESS";
  user_action: "PAY_NOW";
  brand_name: string;
  return_url?: string;
  cancel_url?: string;
}

interface PayPalCreateOrderRequest {
  intent: "CAPTURE";
  purchase_units: PayPalPurchaseUnit[];
  payment_source: {
    paypal: {
      experience_context: PayPalExperienceContext;
    };
  };
}

interface PayPalWebhookEvent {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: PayPalWebhookResource;
}

interface PayPalWebhookResource {
  id: string;
  custom_id?: string;
  status?: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  status_details?: {
    reason?: string;
  };
  purchase_units?: Array<{
    custom_id?: string;
    reference_id?: string;
  }>;
  supplementary_data?: {
    related_ids?: {
      order_id?: string;
    };
  };
}

interface PayPalWebhookHeaders {
  transmissionId: string | null;
  transmissionTime: string | null;
  certUrl: string | null;
  authAlgo: string | null;
  transmissionSig: string | null;
}

interface PayPalVerificationRequest {
  transmission_id: string;
  transmission_time: string;
  cert_url: string;
  auth_algo: string;
  transmission_sig: string;
  webhook_id: string;
  webhook_event: PayPalWebhookEvent;
}

interface PayPalVerificationResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

export class PaymentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigError";
  }
}

export class PayPalProvider implements PaymentProvider {
  readonly providerId = "paypal";
  readonly providerName = "PayPal";
  readonly supportedCurrencies = ["USD", "EUR", "ILS"];

  private config!: PayPalConfig;
  private environment!: "sandbox" | "production";

  async initialize(config: PaymentProviderConfig): Promise<void> {
    const { clientId, clientSecret } = config.credentials;
    if (!clientId || !clientSecret) {
      throw new PaymentConfigError(
        "PayPal requires clientId and clientSecret in credentials"
      );
    }

    if (!this.supportedCurrencies.includes(config.defaultCurrency)) {
      throw new PaymentConfigError(
        `Default currency '${
          config.defaultCurrency
        }' not supported by PayPal. Supported: ${this.supportedCurrencies.join(
          ", "
        )}`
      );
    }

    this.environment = config.environment;
    this.config = {
      clientId,
      clientSecret,
      apiUrl:
        config.environment === "production"
          ? "https://api-m.paypal.com"
          : "https://api-m.sandbox.paypal.com",
    };

    console.log(`PayPal provider initialized:`, {
      environment: this.environment,
      supportedCurrencies: this.supportedCurrencies,
      defaultCurrency: config.defaultCurrency,
    });
  }

  async createPayment(
    request: CreatePaymentRequest
  ): Promise<PaymentResult<CreatePaymentResponse>> {
    try {
      if (!this.supportedCurrencies.includes(request.currency)) {
        return this.createErrorResult(
          PaymentErrorType.VALIDATION_ERROR,
          `Currency '${
            request.currency
          }' not supported by PayPal provider. Supported: ${this.supportedCurrencies.join(
            ", "
          )}`,
          "UNSUPPORTED_CURRENCY",
          false
        );
      }

      const accessToken = await this.getAccessToken();
      const majorUnitAmount = minorToMajorUnit(
        request.amount,
        request.currency
      );

      const purchaseUnit: PayPalPurchaseUnit = {
        reference_id: request.orderNumber,
        description:
          request.description ||
          `Order #${request.orderNumber} - ${request.customer.name}'s Order`,
        custom_id: request.orderId,
        amount: {
          currency_code: request.currency,
          value: majorUnitAmount.toFixed(2),
        },
      };

      if (request.shippingAddress && !request.metadata?.isDigital) {
        purchaseUnit.shipping = this.convertAddressToPayPal(
          request.customer.name,
          request.shippingAddress
        );
      }

      const paypalRequest: PayPalCreateOrderRequest = {
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        payment_source: {
          paypal: {
            experience_context: {
              shipping_preference: request.metadata?.isDigital
                ? "NO_SHIPPING"
                : "SET_PROVIDED_ADDRESS",
              user_action: "PAY_NOW",
              brand_name: "Your Store Template",
              return_url: request.returnUrls?.success,
              cancel_url: request.returnUrls?.cancel,
            },
          },
        },
      };

      const response = await fetch(`${this.config.apiUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(paypalRequest),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("PayPal API error:", {
          status: response.status,
          error: errorData,
        });

        return this.createErrorResult(
          PaymentErrorType.PROVIDER_ERROR,
          `PayPal API error: HTTP ${response.status}`,
          "PAYPAL_API_ERROR",
          this.isRetryableHttpStatus(response.status)
        );
      }

      const paypalOrder: PayPalOrderResponse = await response.json();
      console.log("PayPal order created successfully:", {
        orderId: request.orderId,
        paypalOrderId: paypalOrder.id,
        amount: `${request.amount} minor units → ${majorUnitAmount} ${request.currency}`,
      });

      const approvalLink = paypalOrder.links?.find(
        (link) => link.rel === "approve"
      );

      return {
        success: true,
        data: {
          providerId: this.providerId,
          providerPaymentId: paypalOrder.id,
          status: this.mapPayPalStatusToPaymentStatus(paypalOrder.status),
          approvalUrl: approvalLink?.href,
          providerData: {
            paypalOrderId: paypalOrder.id,
            paypalStatus: paypalOrder.status,
            links: paypalOrder.links,
          },
        },
      };
    } catch (error) {
      console.error("PayPal createPayment error:", error);

      return this.createErrorResult(
        PaymentErrorType.NETWORK_ERROR,
        `Failed to create PayPal payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "CREATE_PAYMENT_FAILED",
        true
      );
    }
  }

  async capturePayment(
    request: CapturePaymentRequest
  ): Promise<PaymentResult<CapturePaymentResponse>> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.config.apiUrl}/v2/checkout/orders/${request.providerPaymentId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("PayPal capture error:", {
          status: response.status,
          error: errorData,
        });

        return this.createErrorResult(
          PaymentErrorType.PROVIDER_ERROR,
          `PayPal capture failed: HTTP ${response.status}`,
          "CAPTURE_FAILED",
          this.isRetryableHttpStatus(response.status)
        );
      }

      const captureData: PayPalCaptureResponse = await response.json();

      if (captureData.status !== "COMPLETED") {
        return this.createErrorResult(
          PaymentErrorType.PAYMENT_DECLINED,
          `Payment not completed. Status: ${captureData.status}`,
          "PAYMENT_NOT_COMPLETED",
          false
        );
      }

      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      if (!capture) {
        return this.createErrorResult(
          PaymentErrorType.PROVIDER_ERROR,
          "No capture data returned from PayPal",
          "NO_CAPTURE_DATA",
          false
        );
      }

      const capturedAmountMajor = parseFloat(capture.amount.value);
      // FIXED: Use currency-aware conversion instead of magic number
      const capturedAmountMinor = majorUnitToMinor(
        capturedAmountMajor,
        capture.amount.currency_code
      );

      const payerInfo: PaymentPayerInfo = {
        email: captureData.payer.email_address,
        name: captureData.payer.name
          ? `${captureData.payer.name.given_name || ""} ${
              captureData.payer.name.surname || ""
            }`.trim()
          : undefined,
        payerId: captureData.payer.payer_id,
      };

      console.log("PayPal payment captured successfully:", {
        orderId: request.orderId,
        transactionId: capture.id,
        amount: `${capturedAmountMajor} ${capture.amount.currency_code} → ${capturedAmountMinor} minor units`,
      });

      return {
        success: true,
        data: {
          transactionId: capture.id,
          status: PaymentStatus.COMPLETED,
          amountCaptured: capturedAmountMinor,
          payerInfo,
          providerData: {
            paypalCaptureId: capture.id,
            paypalStatus: capture.status,
            captureTime: capture.create_time,
          },
        },
      };
    } catch (error) {
      console.error("PayPal capturePayment error:", error);
      return this.createErrorResult(
        PaymentErrorType.NETWORK_ERROR,
        `Failed to capture PayPal payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "CAPTURE_PAYMENT_FAILED",
        true
      );
    }
  }

  async getPaymentStatus(
    paymentId: string
  ): Promise<PaymentResult<PaymentStatusResponse>> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.config.apiUrl}/v2/checkout/orders/${paymentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          PaymentErrorType.PROVIDER_ERROR,
          `Failed to get PayPal payment status: HTTP ${response.status}`,
          "GET_STATUS_FAILED",
          this.isRetryableHttpStatus(response.status)
        );
      }

      const orderData = await response.json();

      return {
        success: true,
        data: {
          status: this.mapPayPalStatusToPaymentStatus(orderData.status),
          lastUpdated: new Date(),
          providerData: orderData,
        },
      };
    } catch (error) {
      console.error("PayPal getPaymentStatus error:", error);
      return this.createErrorResult(
        PaymentErrorType.NETWORK_ERROR,
        `Failed to get PayPal payment status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "GET_STATUS_FAILED",
        true
      );
    }
  }

  async processWebhook(
    payload: unknown,
    signature?: string
  ): Promise<WebhookResult> {
    try {
      const webhookEvent = payload as PayPalWebhookEvent;

      console.log("Processing PayPal webhook:", {
        eventType: webhookEvent.event_type,
        resourceType: webhookEvent.resource_type,
        eventId: webhookEvent.id,
      });

      // Verify webhook signature
      const isVerified = await this.verifyWebhookSignature(
        webhookEvent,
        signature
      );

      if (!isVerified) {
        console.error("PayPal webhook signature verification failed");
        return {
          processed: false,
          event: null,
          shouldUpdateOrder: false,
        };
      }

      // Extract event data
      const eventType = webhookEvent.event_type;
      const resource = webhookEvent.resource;

      // Find order ID from resource
      const orderId = this.extractOrderIdFromWebhook(resource);

      if (!orderId) {
        console.warn("No order ID found in PayPal webhook");
        return {
          processed: true,
          event: {
            eventId: webhookEvent.id,
            eventType,
            timestamp: new Date(webhookEvent.create_time),
            paymentId: resource.id,
            data: webhookEvent,
          },
          shouldUpdateOrder: false,
        };
      }

      // Process different event types
      let shouldUpdate = false;
      let paymentStatus: PaymentStatus | undefined;
      let transactionId: string | undefined;
      let paidAmount: number | undefined;
      switch (eventType) {
        case "PAYMENT.CAPTURE.COMPLETED":
          shouldUpdate = true;
          paymentStatus = PaymentStatus.COMPLETED;
          transactionId = resource.id;
          // Extract and convert amount
          if (resource.amount?.value && resource.amount?.currency_code) {
            paidAmount = majorUnitToMinor(
              parseFloat(resource.amount.value),
              resource.amount.currency_code
            );
          }

          console.log("Payment captured via webhook:", {
            orderId,
            transactionId,
            amount: resource.amount?.value,
            paidAmountMinor: paidAmount,
          });
          break;

        case "PAYMENT.CAPTURE.DENIED":
        case "PAYMENT.CAPTURE.DECLINED":
          shouldUpdate = true;
          paymentStatus = PaymentStatus.FAILED;
          console.log("Payment denied/declined via webhook:", {
            orderId,
            reason: resource.status_details?.reason,
          });
          break;

        case "PAYMENT.CAPTURE.REFUNDED":
          shouldUpdate = true;
          paymentStatus = PaymentStatus.REFUNDED;
          console.log("Payment refunded via webhook:", {
            orderId,
            refundId: resource.id,
          });
          break;

        case "CHECKOUT.ORDER.APPROVED":
          // Don't update - we handle this in the main flow
          console.log(
            "Order approved webhook (handled in main flow):",
            orderId
          );
          break;

        default:
          console.log("Unhandled PayPal webhook event:", eventType);
          break;
      }

      return {
        processed: true,
        event: {
          eventId: webhookEvent.id,
          eventType,
          timestamp: new Date(webhookEvent.create_time),
          paymentId: resource.id,
          orderId,
          data: webhookEvent,
        },
        shouldUpdateOrder: shouldUpdate,
        orderUpdate:
          shouldUpdate && paymentStatus
            ? {
                orderId,
                status: paymentStatus,
                transactionId,
                paidAmount,
              }
            : undefined,
      };
    } catch (error) {
      console.error("PayPal webhook processing error:", error);
      return {
        processed: false,
        event: null,
        shouldUpdateOrder: false,
      };
    }
  }

  async refundPayment(
    request: RefundPaymentRequest
  ): Promise<PaymentResult<RefundPaymentResponse>> {
    try {
      const accessToken = await this.getAccessToken();

      // Build refund request body according to PayPal v2 API spec
      const refundRequestBody: {
        amount?: {
          value: string;
          currency_code: string;
        };
        note?: string;
      } = {};

      // For partial refund, include amount object

      if (request.amount) {
        refundRequestBody.amount = {
          value: minorToMajorUnit(request.amount, request.currency).toFixed(2),
          currency_code: request.currency,
        };
      }

      // Add optional note to payer
      if (request.reason) {
        refundRequestBody.note = request.reason;
      }

      console.log("Processing PayPal refund:", {
        captureId: request.transactionId,
        amount: request.amount
          ? `${request.amount} minor units`
          : "full refund",
        reason: request.reason,
      });

      // Use the correct PayPal v2 refund endpoint
      const response = await fetch(
        `${this.config.apiUrl}/v2/payments/captures/${request.transactionId}/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(refundRequestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("PayPal refund error:", {
          status: response.status,
          error: errorData,
        });

        // Handle specific PayPal error responses
        if (response.status === 422) {
          return this.createErrorResult(
            PaymentErrorType.VALIDATION_ERROR,
            "Refund not possible. Transaction may already be refunded or outside 180-day refund window.",
            "REFUND_NOT_ALLOWED",
            false
          );
        }

        if (response.status === 404) {
          return this.createErrorResult(
            PaymentErrorType.VALIDATION_ERROR,
            "Transaction not found. Please verify the transaction ID.",
            "TRANSACTION_NOT_FOUND",
            false
          );
        }

        return this.createErrorResult(
          PaymentErrorType.PROVIDER_ERROR,
          `PayPal refund failed: HTTP ${response.status}`,
          "REFUND_FAILED",
          this.isRetryableHttpStatus(response.status)
        );
      }

      const refundData = await response.json();
      // Extract refund relevant data
      let amountRefunded = 0;
      if (refundData.amount && refundData.amount.value) {
        amountRefunded = majorUnitToMinor(
          parseFloat(refundData.amount.value),
          refundData.amount.currency_code
        );
      }
      const refundedAt = refundData.create_time
        ? new Date(refundData.create_time)
        : new Date();

      // PayPal v2 refund response structure
      const refundId = refundData.id;
      const refundStatus = refundData.status; // COMPLETED, PENDING, FAILED

      console.log("PayPal refund processed:", {
        refundId,
        status: refundStatus,
        amountRefunded: `${refundData.amount?.value} ${refundData.amount?.currency_code}`,
        createTime: refundData.create_time,
      });

      // Map PayPal refund status to our RefundStatus enum
      const mappedStatus = this.mapPayPalRefundStatus(refundStatus);

      return {
        success: true,
        data: {
          refundId,
          status: mappedStatus,
          amountRefunded,
          refundedAt,
        },
        metadata: {
          providerData: refundData,
        },
      };
    } catch (error) {
      console.error("PayPal refundPayment error:", error);

      return this.createErrorResult(
        PaymentErrorType.NETWORK_ERROR,
        `Failed to process PayPal refund: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "REFUND_NETWORK_ERROR",
        true
      );
    }
  }

  // Private helper methods
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    const response = await fetch(`${this.config.apiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get PayPal access token: HTTP ${response.status}`
      );
    }

    const data = await response.json();
    return data.access_token;
  }

  private convertAddressToPayPal(
    customerName: string,
    address: PaymentAddress
  ): PayPalShipping {
    return {
      name: {
        full_name: customerName,
      },
      address: {
        address_line_1: address.line1,
        address_line_2: address.line2,
        admin_area_2: address.city,
        admin_area_1: address.state,
        postal_code: address.postalCode,
        country_code: address.country,
      },
    };
  }

  private mapPayPalStatusToPaymentStatus(paypalStatus: string): PaymentStatus {
    switch (paypalStatus.toUpperCase()) {
      case "CREATED":
        return PaymentStatus.CREATED;
      case "SAVED":
      case "PAYER_ACTION_REQUIRED":
        return PaymentStatus.PENDING;
      case "APPROVED":
        return PaymentStatus.APPROVED;
      case "COMPLETED":
        return PaymentStatus.COMPLETED;
      case "CANCELLED":
      case "VOIDED":
        return PaymentStatus.CANCELLED;
      default:
        console.warn(`Unknown PayPal status: ${paypalStatus}`);
        return PaymentStatus.PENDING;
    }
  }

  private isRetryableHttpStatus(status: number): boolean {
    return status >= 500 || status === 429;
  }

  private createErrorResult(
    type: PaymentErrorType,
    message: string,
    code: string,
    retryable: boolean
  ): PaymentResult<never> {
    const error: PaymentError = {
      type,
      message,
      code,
      retryable,
    };

    return {
      success: false,
      error,
    };
  }
  /**
   * Verify PayPal webhook signature
   */
  private async verifyWebhookSignature(
    webhookEvent: PayPalWebhookEvent,
    signatureData?: string
  ): Promise<boolean> {
    try {
      if (webhookEvent.id.startsWith("WH-") && this.environment === "sandbox") {
        console.warn(
          "⚠️ Skipping verification for sandbox webhook simulator event"
        );
        return true; // Allow simulator events through in sandbox
      }

      if (!signatureData) {
        console.error("No signature data provided for webhook verification");
        return false;
      }

      const headers: PayPalWebhookHeaders = JSON.parse(signatureData);

      if (!headers.transmissionId || !headers.transmissionSig) {
        console.error("Missing required headers for webhook verification");
        return false;
      }

      const accessToken = await this.getAccessToken();

      const verificationRequest: PayPalVerificationRequest = {
        transmission_id: headers.transmissionId,
        transmission_time: headers.transmissionTime!,
        cert_url: headers.certUrl!,
        auth_algo: headers.authAlgo!,
        transmission_sig: headers.transmissionSig,
        webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
        webhook_event: webhookEvent,
      };

      const response = await fetch(
        `${this.config.apiUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(verificationRequest),
        }
      );

      if (!response.ok) {
        console.error("PayPal signature verification failed:", response.status);
        return false;
      }

      const result: PayPalVerificationResponse = await response.json();
      const isVerified = result.verification_status === "SUCCESS";

      console.log("PayPal webhook verification:", {
        status: result.verification_status,
        verified: isVerified,
      });

      return isVerified;
    } catch (error) {
      console.error("PayPal webhook verification error:", error);
      return false;
    }
  }

  /**
   * Extract order ID from PayPal webhook resource
   */
  private extractOrderIdFromWebhook(
    resource: PayPalWebhookResource
  ): string | undefined {
    // Try custom_id first (this is our database order ID)
    if (resource.custom_id) {
      return resource.custom_id;
    }

    // Check purchase_units for custom_id
    if (resource.purchase_units && resource.purchase_units.length > 0) {
      const customId = resource.purchase_units[0].custom_id;
      if (customId) {
        return customId;
      }
    }

    // Check supplementary_data as fallback
    if (resource.supplementary_data?.related_ids?.order_id) {
      return resource.supplementary_data.related_ids.order_id;
    }

    return undefined;
  }

  private mapPayPalRefundStatus(paypalStatus: string): RefundStatus {
    switch (paypalStatus.toUpperCase()) {
      case "COMPLETED":
        return RefundStatus.COMPLETED;
      case "PENDING":
        return RefundStatus.PENDING;
      case "FAILED":
      case "CANCELLED":
        return RefundStatus.FAILED;
      default:
        console.warn(`Unknown PayPal refund status: ${paypalStatus}`);
        return RefundStatus.PENDING;
    }
  }
}
