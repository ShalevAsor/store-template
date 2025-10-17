"use server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, OrderWithItems } from "@/types/order";
import { ActionResult } from "@/types/common";
import { createErrorResult } from "@/utils/errorUtils";
import { PaymentStatus, Prisma } from "@prisma/client";
import type { CartItem } from "@/types/cart";
import type { CheckoutFormData } from "@/schemas/checkoutSchema";
import { generateOrderNumber, calculateOrderTotals } from "@/utils/orderUtils";
import { revalidatePath } from "next/cache";
import { getPaymentService } from "@/services/payment/PaymentService";
import { getPaymentProvider } from "@/utils/paymentUtils";

export interface RefundOrderResult {
  success: boolean;
  refundId?: string;
  amountRefunded?: number;
  message: string;
}

/**
 * Update product stock levels after order creation
 * Moved from stock validation - this is part of order fulfillment, not validation
 */
export async function updateStockForOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Get order items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    for (const item of order.orderItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock !== null) {
        if (product.stock < item.quantity) {
          console.error(`Oversold detected after payment: ${product.name}`, {
            available: product.stock,
            ordered: item.quantity,
            shortage: item.quantity - product.stock,
            productId: item.productId,
            orderId,
            timestamp: new Date().toISOString(),
          });
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }
  });
}

/**
 * Create order with items - extracted from checkout action
 * Handles all order creation logic including digital/physical product differences
 */
export async function createOrderWithItems(
  validatedData: CheckoutFormData,
  cartItems: CartItem[],
  tx: Prisma.TransactionClient
) {
  // Calculate order totals
  const orderTotals = calculateOrderTotals(cartItems);

  const { shippingAddress } = validatedData;
  const addressFields = orderTotals.isDigital
    ? {
        shippingLine1: null,
        shippingLine2: null,
        shippingCity: null,
        shippingState: null,
        shippingPostalCode: null,
        shippingCountry: null,
      }
    : {
        shippingLine1: shippingAddress?.line1,
        shippingLine2: shippingAddress?.line2,
        shippingCity: shippingAddress?.city,
        shippingState: shippingAddress?.state,
        shippingPostalCode: shippingAddress?.postalCode,
        shippingCountry: shippingAddress?.country,
      };

  // Create the order with all items
  const order = await tx.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone,
      // Structured shipping address fields (only for physical products)
      ...addressFields,
      paymentMethod: validatedData.paymentMethod,
      paymentProviderId: getPaymentProvider(validatedData.paymentMethod),
      isDigital: orderTotals.isDigital,
      subtotal: orderTotals.subtotal,
      shippingAmount: orderTotals.shipping,
      taxAmount: orderTotals.tax,
      orderItems: {
        create: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      orderItems: true,
    },
  });

  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult<void>> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: true,
      },
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating order status:", error);

    return createErrorResult({ error });
  }
}

// src/lib/actions/orderActions.ts

/**
 * Update order from webhook event
 * Checks if order is already updated to prevent duplicates
 */
export async function updateOrderFromWebhook(orderUpdate: {
  orderId: string;
  status: PaymentStatus;
  transactionId?: string;
  paidAmount?: number;
  payerEmail?: string;
}): Promise<{ status: OrderStatus; paymentStatus: PaymentStatus } | null> {
  try {
    const { orderId, status, transactionId, paidAmount, payerEmail } =
      orderUpdate;

    // Handle payment completion
    if (status === PaymentStatus.COMPLETED && transactionId) {
      const { order } = await completeOrderPayment(
        orderId,
        transactionId,
        paidAmount || 0,
        payerEmail
      );

      if (!order) {
        return null;
      }

      return {
        status: order.status,
        paymentStatus: order.paymentStatus,
      };
    }

    // Handle payment failures/cancellations
    if (status === PaymentStatus.FAILED || status === PaymentStatus.CANCELLED) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: status,
          status: OrderStatus.CANCELLED,
        },
        select: {
          status: true,
          paymentStatus: true,
        },
      });

      console.log("Order cancelled from webhook:", { orderId, status });

      // TODO: Notify customer if payment failed
      if (status === PaymentStatus.FAILED) {
        // await sendPaymentFailedEmail(updatedOrder);
      }

      return updatedOrder;
    }

    return null;
  } catch (error) {
    console.error("Error updating order from webhook:", error);
    throw error;
  }
}

/**
 * Called when payment webhook triggered or in capture payment order
 * This function update the order status and handle the payment complete flow
 */
export async function completeOrderPayment(
  orderId: string,
  transactionId: string,
  paidAmount: number,
  payerEmail?: string
): Promise<{ updated: boolean; order: OrderWithItems | null }> {
  try {
    // Check if already completed
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentStatus: true,
        status: true,
        isDigital: true,
        transactionId: true,
      },
    });

    if (!existing) {
      console.error(`Order ${orderId} not found for payment completion`);
      return { updated: false, order: null };
    }

    if (existing.paymentStatus === PaymentStatus.COMPLETED) {
      console.log(`Order ${orderId} already completed, skipping update`);
      // Return existing order data without updating
      const fullOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });
      return { updated: false, order: fullOrder };
    }
    console.log("About to update order with:", {
      orderId,
      transactionId,
      paidAmount,
      payerEmail,
      hasPayerEmail: !!payerEmail,
    });
    await updateStockForOrder(orderId);

    // Perform the update
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
        transactionId,
        paidAmount,
        paidAt: new Date(),
        ...(payerEmail && { payerEmail }),
      },
      include: { orderItems: true },
    });
    console.log("Order updated with payerEmail:", updatedOrder.payerEmail);

    console.log("Order payment completed:", {
      orderId,
      transactionId,
      paidAmount,
    });

    // TODO: Send confirmation email when payment completed
    // await sendOrderConfirmationEmail(updatedOrder);

    // TODO: Handle digital product delivery when payment completed
    if (updatedOrder.isDigital) {
      // await deliverDigitalProducts(updatedOrder);
    }

    return { updated: true, order: updatedOrder };
  } catch (error) {
    console.error("Error completing order payment:", error);
    throw error;
  }
}

/**
 * Check order payment status for polling
 * Used by client components to verify if webhook completed payment
 */
export async function checkOrderPaymentStatus(orderId: string): Promise<{
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  isCompleted: boolean;
  lastUpdated?: Date;
  transactionId?: string | null;
}> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        paymentStatus: true,
        status: true,
        transactionId: true,
        updatedAt: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const isCompleted = order.paymentStatus === PaymentStatus.COMPLETED;

    // Log for debugging
    if (isCompleted) {
      console.log(
        `✅ Order ${orderId} payment completed - Status: ${order.paymentStatus}, TransactionId: ${order.transactionId}`
      );
    }

    return {
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      isCompleted,
      lastUpdated: order.updatedAt,
      transactionId: order.transactionId,
    };
  } catch (error) {
    console.error("Error checking order payment status:", error);
    throw error;
  }
}

/**
 * Mark order as failed when payment genuinely fails
 */
export async function markOrderAsFailed(orderId: string): Promise<void> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
        updatedAt: new Date(),
      },
    });

    console.log(`Order ${orderId} marked as failed`);
  } catch (error) {
    console.error(`Error marking order ${orderId} as failed:`, error);
  }
}
/**
 * Cancel an unshipped order - refunds payment and restocks inventory
 */

export async function cancelOrder(
  orderId: string,
  reason?: string,
  shouldRestock: boolean = true
): Promise<ActionResult<RefundOrderResult>> {
  try {
    console.log(`Cancelling order ${orderId}:`, { reason, shouldRestock });

    // Get order with items for validation and refund processing
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return createErrorResult({
        message: "Order not found",
      });
    }

    // Validate order can be cancelled
    if (!["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)) {
      return createErrorResult({
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    if (order.status === "PROCESSING") {
      console.warn(
        `Cancelling order in PROCESSING status - ensure it hasn't shipped`
      );
    }

    // Handle refund processing - more graceful approach
    let refundResult = null;

    if (!order.paymentProviderId) {
      console.warn(
        `Order ${orderId} has no payment provider - skipping refund processing`
      );
    } else if (order.paymentStatus === "COMPLETED" && order.transactionId) {
      // Only try to refund if we have all the necessary info
      const paymentService = await getPaymentService();

      refundResult = await paymentService.refundPayment({
        transactionId: order.transactionId,
        reason: reason || `Order cancelled: ${order.orderNumber}`,
        providerId: order.paymentProviderId,
        currency: process.env.DEFAULT_CURRENCY || "USD",
        // amount omitted for full refund
      });
      if (!refundResult.success) {
        console.error("Refund failed during cancellation:", refundResult.error);

        // Handle specific refund errors more gracefully
        if (refundResult.error?.code === "REFUND_NOT_ALLOWED") {
          console.warn("Refund not possible - order may already be refunded");
          // Continue with cancellation even if refund fails
        } else {
          return createErrorResult({
            message: `Failed to process refund: ${
              refundResult.error?.message || "Unknown error"
            }`,
          });
        }
      }
    } else {
      console.log(
        `Order ${orderId} - no refund needed (payment not completed or no transaction ID)`
      );
    }

    // Update order status and restock inventory in transaction
    await prisma.$transaction(async (tx) => {
      // Calculate refund amount for tracking
      const refundAmount = refundResult?.data?.amountRefunded;

      // Update order status with refund tracking
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          paymentStatus:
            order.paymentStatus === "COMPLETED" && refundResult?.success
              ? PaymentStatus.REFUNDED
              : order.paymentStatus,
          refundAmount: refundAmount || order.refundAmount,
          refundedAt: refundResult?.data?.refundedAt || order.refundedAt,
          refundId: refundResult?.data?.refundId || order.refundId,
        },
      });

      // Restock inventory if requested
      if (shouldRestock) {
        for (const item of order.orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });

          // Only restock if product has stock tracking (not unlimited)
          if (product && product.stock !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }
    });

    console.log(`Order ${orderId} cancelled successfully`, {
      refunded: refundResult?.success || false,
      restocked: shouldRestock,
      refundAmount: refundResult?.data?.amountRefunded,
    });

    // Revalidate admin pages
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    const message = refundResult?.success
      ? `Order ${order.orderNumber} has been cancelled and refunded`
      : `Order ${order.orderNumber} has been cancelled${
          order.paymentStatus === "COMPLETED"
            ? " (refund may require manual processing)"
            : ""
        }`;

    return {
      success: true,
      data: {
        success: true,
        refundId: refundResult?.data?.refundId,
        amountRefunded: refundResult?.data?.amountRefunded,
        message,
      },
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return createErrorResult({
      message: "Failed to cancel order. Please try again.",
    });
  }
}
/**
 * Process refund for shipped orders - refunds payment only, no restocking
 */
export async function refundOrder(
  orderId: string,
  amount?: number,
  reason?: string
): Promise<ActionResult<RefundOrderResult>> {
  try {
    console.log(`Processing refund for order ${orderId}:`, { amount, reason });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return createErrorResult({
        message: "Order not found",
      });
    }
    if (!order.paymentProviderId) {
      return createErrorResult({
        message:
          "This order has not provider id . it cannot be refund from this action",
      });
    }

    // Validate payment can be refunded
    if (order.paymentStatus !== "COMPLETED") {
      return createErrorResult({
        message: `Cannot refund order with payment status: ${order.paymentStatus}`,
      });
    }

    if (!order.transactionId) {
      return createErrorResult({
        message: "No transaction ID found for refund",
      });
    }

    // Check if this would exceed previous refunds
    const totalOrderAmount =
      order.subtotal + (order.shippingAmount || 0) + (order.taxAmount || 0);
    const previousRefundAmount = order.refundAmount || 0;
    const requestedRefundAmount = amount || totalOrderAmount;

    if (previousRefundAmount + requestedRefundAmount > totalOrderAmount) {
      return createErrorResult({
        message: `Refund amount would exceed order total. Already refunded: $${
          previousRefundAmount / 100
        }, Order total: $${totalOrderAmount / 100}`,
      });
    }

    // Process refund with payment provider
    const paymentService = await getPaymentService();

    const refundResult = await paymentService.refundPayment({
      transactionId: order.transactionId,
      amount, // Can be partial refund
      reason: reason || `Refund for order: ${order.orderNumber}`,
      providerId: order.paymentProviderId,
      currency: process.env.DEFAULT_CURRENCY || "USD",
    });

    if (!refundResult.success) {
      console.error("Refund processing failed:", refundResult.error);
      return createErrorResult({
        message: `Failed to process refund: ${
          refundResult.error?.message || "Unknown error"
        }`,
      });
    }

    // Calculate new refund totals
    const newRefundAmount = refundResult.data?.amountRefunded || 0;
    const totalRefundAmount = previousRefundAmount + newRefundAmount;
    const isFullRefund = totalRefundAmount >= totalOrderAmount;

    // Update order with refund tracking
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: isFullRefund
          ? PaymentStatus.REFUNDED
          : PaymentStatus.COMPLETED,
        refundAmount: totalRefundAmount,
        refundedAt: refundResult.data?.refundedAt || new Date(),
        refundId: refundResult.data?.refundId,
      },
    });

    console.log(`Refund processed for order ${orderId}:`, {
      refundId: refundResult.data?.refundId,
      newRefundAmount,
      totalRefundAmount,
      isFullRefund,
    });

    // Revalidate admin pages
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return {
      success: true,
      data: {
        success: true,
        refundId: refundResult.data?.refundId,
        amountRefunded: newRefundAmount,
        message: `${isFullRefund ? "Full" : "Partial"} refund of $${
          newRefundAmount / 100
        } processed for order ${order.orderNumber}. Total refunded: $${
          totalRefundAmount / 100
        }`,
      },
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    return createErrorResult({
      message: "Failed to process refund. Please try again.",
    });
  }
}

export async function updatePaymentStatus(
  orderId: string,
  newStatus: PaymentStatus
): Promise<ActionResult<void>> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newStatus,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return createErrorResult({ message: "Failed to update payment status" });
  }
}
