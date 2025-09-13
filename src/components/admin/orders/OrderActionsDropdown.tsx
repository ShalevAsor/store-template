"use client";

import {
  ActionsDropdown,
  ActionConfig,
} from "@/components/shared/ActionsDropdown";
import { Eye, RefreshCw, Truck, CheckCircle, Ban } from "lucide-react";
import { SerializedOrder } from "@/types/order";

interface OrderActionsDropdownProps {
  order: SerializedOrder;
  onCancel: () => void;
  onUpdateStatus: (newStatus: string) => void;
  onRefund: () => void;
  isDetailPage?: boolean; // Add this to hide "View Order" when on detail page
}

export const OrderActionsDropdown: React.FC<OrderActionsDropdownProps> = ({
  order,
  onCancel,
  onUpdateStatus,
  onRefund,
  isDetailPage = false,
}) => {
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const canRefund = ["PAID", "COMPLETED", "DELIVERED"].includes(
    order.paymentStatus
  );
  const canMarkShipped = order.status === "PROCESSING" && !order.isDigital;
  const canMarkDelivered = order.status === "SHIPPED";
  const canMarkCompleted = ["DELIVERED", "SHIPPED"].includes(order.status);

  // Configure actions for orders
  const actions: ActionConfig[] = [];

  // Only show "View Order" if not on detail page
  if (!isDetailPage) {
    actions.push(
      {
        type: "link",
        label: "View Order",
        icon: Eye,
        href: `/admin/orders/${order.id}`,
      },
      {
        type: "separator",
      }
    );
  }

  // Add status update actions based on current status
  if (order.status === "PENDING") {
    actions.push({
      type: "button",
      label: "Mark as Confirmed",
      icon: CheckCircle,
      onClick: () => onUpdateStatus("CONFIRMED"),
      className: "text-green-600 focus:text-green-600",
    });
  }

  if (order.status === "CONFIRMED") {
    actions.push({
      type: "button",
      label: "Mark as Processing",
      icon: RefreshCw,
      onClick: () => onUpdateStatus("PROCESSING"),
      className: "text-blue-600 focus:text-blue-600",
    });
  }

  if (canMarkShipped) {
    actions.push({
      type: "button",
      label: "Mark as Shipped",
      icon: Truck,
      onClick: () => onUpdateStatus("SHIPPED"),
      className: "text-purple-600 focus:text-purple-600",
    });
  }

  if (canMarkDelivered) {
    actions.push({
      type: "button",
      label: "Mark as Delivered",
      icon: CheckCircle,
      onClick: () => onUpdateStatus("DELIVERED"),
      className: "text-green-600 focus:text-green-600",
    });
  }

  if (canMarkCompleted) {
    actions.push({
      type: "button",
      label: "Mark as Completed",
      icon: CheckCircle,
      onClick: () => onUpdateStatus("COMPLETED"),
      className: "text-green-600 focus:text-green-600",
    });
  }

  // Add separator before destructive actions if we have status actions
  if (actions.length > 0) {
    actions.push({ type: "separator" });
  }

  // Add refund action
  if (canRefund) {
    actions.push({
      type: "button",
      label: "Process Refund",
      icon: RefreshCw,
      onClick: onRefund,
      className: "text-orange-600 focus:text-orange-600",
    });
  }

  // Add cancel action
  if (canCancel) {
    actions.push({
      type: "button",
      label: "Cancel Order",
      icon: Ban,
      onClick: onCancel,
      className: "text-red-600 focus:text-red-600",
    });
  }

  // Don't render if no actions available
  if (actions.length === 0) {
    return null;
  }

  return <ActionsDropdown actions={actions} label="Actions" />;
};
