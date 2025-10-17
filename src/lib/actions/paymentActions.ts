"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getPaymentService } from "@/services/payment/PaymentService";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { ActionResult } from "@/types/common";
import { createErrorResult } from "@/utils/errorUtils";
import { PaymentAddress } from "@/services/payment/core/PaymentConfig";
import { completeOrderPayment } from "./orderActions";
import { getTotalAmount } from "@/utils/orderUtils";
import { createPaymentErrorResult } from "@/utils/paymentUtils";

export interface CapturePaymentOrderResult {
  success: boolean;
  data?: {
    transactionId: string;
    message: string;
  };
  error?: string;
}

type CreatePaymentOrderData = {
  providerPaymentId: string;
  approvalUrl?: string;
};
type CapturePaymentOrderData = {
  transactionId: string;
  message: string;
};

/**
 * Create a payment order using the new payment service
 * Works with any configured payment provider (currently PayPal, future: Stripe, etc.)
 */
export async function createPaymentOrder(
  orderId: string
): Promise<ActionResult<CreatePaymentOrderData>> {
  try {
    console.log("Creating payment order:", { orderId });

    // Get the order with order items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      console.error("Order not found when creating payment:", orderId);
      return createErrorResult({
        message: "Order not found. Please try again.",
      });
    }

    // Ensure order is in PENDING status
    if (order.status !== OrderStatus.PENDING) {
      console.error("Cannot create payment for non-PENDING order:", {
        orderId,
        status: order.status,
      });
      return createErrorResult({
        message: "Order is no longer available for payment.",
      });
    }

    // Get payment service
    const paymentService = await getPaymentService();

    // Build shipping address
    const shippingAddress: PaymentAddress | undefined =
      order.shippingLine1 && !order.isDigital
        ? {
            line1: order.shippingLine1,
            line2: order.shippingLine2 || undefined,
            city: order.shippingCity!,
            state: order.shippingState || undefined,
            postalCode: order.shippingPostalCode!,
            country: order.shippingCountry!,
          }
        : undefined;

    const total = getTotalAmount(
      order.subtotal,
      order.shippingAmount,
      order.taxAmount
    );

    // Create payment request
    const result = await paymentService.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: total,
      currency: process.env.DEFAULT_CURRENCY || "USD",
      description: `Order #${order.orderNumber} - ${order.customerName}'s Order`,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone || undefined,
      },
      shippingAddress,
      providerId: order.paymentProviderId || undefined,
      metadata: {
        isDigital: order.isDigital,
        items: order.orderItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.price, // Already in minor units
        })),
      },
    });

    if (!result.success) {
      console.error("Payment service error:", result.error);
      return createPaymentErrorResult(result.error);
    }
    const { providerId, providerPaymentId, status, approvalUrl } = result.data!;

    // Update order with payment provider information
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: providerPaymentId,
        paymentStatus: status,
        // store which provider was actually used (in case of auto-selected)
        paymentProviderId: providerId,
      },
    });

    console.log("Payment order created successfully:", {
      orderId,
      providerPaymentId,
      status,
    });

    return {
      success: true,
      data: {
        providerPaymentId: providerPaymentId,
        approvalUrl: approvalUrl,
      },
    };
  } catch (error) {
    console.error("Error creating payment order:", { error, orderId });
    return createErrorResult({ error });
  }
}

/**
 * Capture a payment after user approval
 * Send email confirmation
 */
export async function capturePaymentOrder(
  orderId: string,
  providerPaymentId: string
): Promise<ActionResult<CapturePaymentOrderData>> {
  try {
    console.log("Capturing payment:", {
      orderId,
      providerPaymentId,
    });

    // Verify the order exists and has the correct payment ID
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error("Order not found when capturing payment:", orderId);
      return createErrorResult({
        message: "Order not found. Please contact support",
      });
    }

    if (order.paymentId !== providerPaymentId) {
      console.error("Payment ID mismatch:", {
        orderPaymentId: order.paymentId,
        providerPaymentId,
      });
      return createErrorResult({
        message: "Payment verification failed. Please contact support.",
      });
    }

    // Get payment service and capture payment
    const paymentService = await getPaymentService();
    const result = await paymentService.capturePayment({
      orderId,
      providerPaymentId,
      providerId: order.paymentProviderId || undefined,
    });

    if (!result.success) {
      console.error("Payment capture failed:", result.error);
      return createPaymentErrorResult(result.error);
    }

    // Use shared function to update order (handles race condition)
    const { updated } = await completeOrderPayment(
      orderId,
      result.data!.transactionId,
      result.data!.amountCaptured,
      result.data!.payerInfo?.email
    );

    if (updated) {
      console.log("Payment captured and order updated successfully");
      // Revalidate paths only if we actually updated
      revalidatePath(`/checkout/success/${orderId}`);
      revalidatePath("/admin/orders");
    } else {
      console.log("Payment already completed by webhook or previous capture");
    }

    const { transactionId } = result.data!;

    return {
      success: true,
      data: {
        transactionId,
        message: "Payment processed successfully",
      },
    };
  } catch (error) {
    console.error("Error capturing payment:", {
      error,
      orderId,
      providerPaymentId,
    });
    return createErrorResult({
      message:
        "Payment processing failed. Please try again or contact support.",
    });
  }
}

/**
 * Get payment status from provider (useful for polling or verification)
 */
export async function getPaymentStatus(
  providerPaymentId: string,
  providerId: string = "paypal"
): Promise<ActionResult<{ status: PaymentStatus }>> {
  try {
    const paymentService = await getPaymentService();
    const result = await paymentService.getPaymentStatus(
      providerPaymentId,
      providerId
    );

    if (!result.success) {
      return createErrorResult({
        message: result.error?.message || "Failed to get payment status",
      });
    }

    return {
      success: true,
      data: {
        status: result.data!.status,
      },
    };
  } catch (error) {
    console.error("Error getting payment status:", error);
    return {
      success: false,
      error: "Failed to check payment status",
    };
  }
}
