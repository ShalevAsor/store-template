"use client";

import { toast } from "sonner";
import { useModalStore } from "@/store/modalStore";
// TODO: Import these when you create the order actions
// import { cancelOrder, updateOrderStatus, processRefund } from "@/lib/actions/orderActions";

export function useOrderActions() {
  const { onOpen } = useModalStore();

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    onOpen("confirmAction", {
      confirmAction: {
        title: "Cancel Order",
        description: `Are you sure you want to cancel order ${orderNumber}? This action cannot be undone.`,
        confirmText: "Cancel Order",
        cancelText: "Keep Order",
        onConfirm: async () => {
          try {
            // TODO: Implement cancelOrder action
            // const result = await cancelOrder(orderId);
            // if (result.success) {
            //   toast.success(`Order ${orderNumber} cancelled successfully`);
            // } else {
            //   toast.error(result.error || "Failed to cancel order");
            //   throw new Error(result.error);
            // }

            // Mock success for now
            toast.success(`Order ${orderNumber} cancelled successfully`);
          } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("An error occurred while cancelling the order");
            throw error; // Re-throw to keep modal open
          }
        },
      },
    });
  };

  const handleUpdateStatus = async (
    orderId: string,
    orderNumber: string,
    newStatus: string
  ) => {
    try {
      // TODO: Implement updateOrderStatus action
      // const result = await updateOrderStatus(orderId, newStatus);
      // if (result.success) {
      //   toast.success(`Order ${orderNumber} status updated to ${newStatus}`);
      // } else {
      //   toast.error(result.error || "Failed to update order status");
      // }

      // Mock success for now
      toast.success(`Order ${orderNumber} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating the order status");
    }
  };

  const handleProcessRefund = (
    orderId: string,
    orderNumber: string,
    amount: number
  ) => {
    onOpen("confirmAction", {
      confirmAction: {
        title: "Process Refund",
        description: `Are you sure you want to process a refund of ${amount.toLocaleString(
          "en-US",
          { style: "currency", currency: "USD" }
        )} for order ${orderNumber}?`,
        confirmText: "Process Refund",
        cancelText: "Cancel",
        onConfirm: async () => {
          try {
            // TODO: Implement processRefund action
            // const result = await processRefund(orderId, amount);
            // if (result.success) {
            //   toast.success(`Refund processed for order ${orderNumber}`);
            // } else {
            //   toast.error(result.error || "Failed to process refund");
            //   throw new Error(result.error);
            // }

            // Mock success for now
            toast.success(`Refund processed for order ${orderNumber}`);
          } catch (error) {
            console.error("Error processing refund:", error);
            toast.error("An error occurred while processing the refund");
            throw error; // Re-throw to keep modal open
          }
        },
      },
    });
  };

  return {
    handleCancelOrder,
    handleUpdateStatus,
    handleProcessRefund,
  };
}
