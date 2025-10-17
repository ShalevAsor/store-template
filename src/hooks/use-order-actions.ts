"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useModalStore } from "@/store/modalStore";
import {
  cancelOrder,
  refundOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/lib/actions/orderActions";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import {
  getAvailableOrderStatuses,
  getAvailablePaymentStatuses,
} from "@/utils/statusUtils";

export function useOrderActions() {
  const { onOpen } = useModalStore();
  const router = useRouter();

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    onOpen("confirmAction", {
      confirmAction: {
        title: "Cancel & Refund Order",
        description: `Are you sure you want to cancel order ${orderNumber}? This will:\n\n• Refund the customer (if payment was captured)\n• Restock inventory\n• Send cancellation notification\n\nThis action cannot be undone.`,
        confirmText: "Cancel & Refund Order",
        cancelText: "Keep Order",
        onConfirm: async () => {
          const result = await cancelOrder(
            orderId,
            "Order cancelled by admin",
            true
          );
          if (result.success) {
            toast.success(
              result.data?.message ||
                `Order ${orderNumber} cancelled successfully`
            );
            router.refresh();
          } else {
            toast.error(result.error || "Failed to cancel order");
            throw new Error(result.error);
          }
        },
      },
    });
  };

  const handleChangeOrderStatus = (
    orderId: string,
    orderNumber: string,
    currentStatus: OrderStatus
  ) => {
    const availableStatuses = getAvailableOrderStatuses(currentStatus);

    if (availableStatuses.length === 0) {
      toast.info(`No status changes available for ${currentStatus} orders`);
      return;
    }

    onOpen("statusSelection", {
      statusSelection: {
        title: "Change Order Status",
        currentStatus,
        availableStatuses,
        onConfirm: async (newStatus: OrderStatus | PaymentStatus) => {
          const result = await updateOrderStatus(
            orderId,
            newStatus as OrderStatus
          );
          if (result.success) {
            toast.success(
              `Order ${orderNumber} status updated to ${newStatus}`
            );
          } else {
            toast.error(result.error || "Failed to update order status");
            throw new Error(result.error);
          }
        },
      },
    });
  };

  const handleChangePaymentStatus = (
    orderId: string,
    orderNumber: string,
    currentStatus: PaymentStatus
  ) => {
    const availableStatuses = getAvailablePaymentStatuses(currentStatus);

    if (availableStatuses.length === 0) {
      toast.info(
        `No payment status changes available for ${currentStatus} payments`
      );
      return;
    }

    onOpen("statusSelection", {
      statusSelection: {
        title: "Change Payment Status",
        currentStatus,
        availableStatuses,
        onConfirm: async (newStatus: OrderStatus | PaymentStatus) => {
          const result = await updatePaymentStatus(
            orderId,
            newStatus as PaymentStatus
          );
          if (result.success) {
            toast.success(
              `Payment status updated to ${newStatus} for order ${orderNumber}`
            );
          } else {
            toast.error(result.error || "Failed to update payment status");
            throw new Error(result.error);
          }
        },
      },
    });
  };

  const handleProcessRefund = (
    orderId: string,
    orderNumber: string,
    totalAmount: number,
    alreadyRefunded: number = 0
  ) => {
    onOpen("refund", {
      refund: {
        orderNumber,
        orderId,
        totalAmount,
        alreadyRefunded,
        onConfirm: async (amount?: number, reason?: string) => {
          const result = await refundOrder(
            orderId,
            amount,
            reason || "Refund processed by admin"
          );
          if (result.success) {
            toast.success(
              result.data?.message ||
                `Refund processed for order ${orderNumber}`
            );
            router.refresh();
          } else {
            toast.error(result.error || "Failed to process refund");
            throw new Error(result.error);
          }
        },
      },
    });
  };

  return {
    handleCancelOrder,
    handleChangeOrderStatus,
    handleChangePaymentStatus,
    handleProcessRefund,
  };
}
