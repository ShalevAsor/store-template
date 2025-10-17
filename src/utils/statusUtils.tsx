// src/utils/statusUtils.tsx
import { Badge } from "@/components/ui/badge";
import { Product, PaymentStatus, OrderStatus } from "@prisma/client";

export interface StatusOption<T = OrderStatus | PaymentStatus> {
  value: T;
  label: string;
  description?: string;
}
export type OrderStatusOption = StatusOption<OrderStatus>;
export type PaymentStatusOption = StatusOption<PaymentStatus>;

/**
 * Get badge component for product status
 */
export function getProductStatusBadge(status: Product["status"]) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "ARCHIVED":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/**
 * Get stock display text with styling
 */
export function getStockDisplay(stock: number | null, isDigital: boolean) {
  if (isDigital) {
    return <span className="text-blue-600 text-sm">Digital</span>;
  }

  if (stock === null) {
    return <span className="text-green-600 text-sm">Unlimited</span>;
  }

  if (stock === 0) {
    return <span className="text-red-600 text-sm">Out of stock</span>;
  }

  if (stock <= 5) {
    return (
      <span className="text-orange-600 text-sm">{stock} in stock (Low)</span>
    );
  }

  return <span className="text-gray-900 text-sm">{stock} in stock</span>;
}

/**
 * Get badge component for order status
 */
export function getOrderStatusBadge(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
    case "PROCESSING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      );
    case "SHIPPED":
      return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
    case "DELIVERED":
      return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    case "REFUNDED":
      return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/**
 * Get badge component for payment status
 */
export function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "CREATED":
      return <Badge className="bg-gray-100 text-gray-800">Created</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "APPROVED":
      return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-orange-100 text-orange-800">Cancelled</Badge>;
    case "EXPIRED":
      return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
    case "REFUNDED":
      return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
/**
 * Get all available order statuses (excluding current status)
 * Admin has full flexibility to change to any status
 */
export function getAvailableOrderStatuses(
  currentStatus: OrderStatus
): OrderStatusOption[] {
  const allStatuses: OrderStatusOption[] = [
    {
      value: OrderStatus.PENDING,
      label: "Pending",
      description: "Order received, awaiting confirmation",
    },
    {
      value: OrderStatus.CONFIRMED,
      label: "Confirmed",
      description: "Order confirmed, preparing for fulfillment",
    },
    {
      value: OrderStatus.PROCESSING,
      label: "Processing",
      description: "Order being prepared and packed",
    },
    {
      value: OrderStatus.SHIPPED,
      label: "Shipped",
      description: "Order shipped to customer",
    },
    {
      value: OrderStatus.DELIVERED,
      label: "Delivered",
      description: "Order delivered to customer",
    },
    {
      value: OrderStatus.COMPLETED,
      label: "Completed",
      description: "Order fulfilled and completed",
    },
    {
      value: OrderStatus.CANCELLED,
      label: "Cancelled",
      description: "Order cancelled",
    },
    {
      value: OrderStatus.REFUNDED,
      label: "Refunded",
      description: "Order refunded to customer",
    },
  ];

  // Return all statuses except the current one
  return allStatuses.filter((status) => status.value !== currentStatus);
}

/**
 * Get all available payment statuses (excluding current status)
 * Admin has full flexibility to change to any status
 */
export function getAvailablePaymentStatuses(
  currentStatus: PaymentStatus
): PaymentStatusOption[] {
  const allStatuses: PaymentStatusOption[] = [
    {
      value: PaymentStatus.CREATED,
      label: "Created",
      description: "Payment created, awaiting user action",
    },
    {
      value: PaymentStatus.PENDING,
      label: "Pending",
      description: "Payment initiated, processing",
    },
    {
      value: PaymentStatus.APPROVED,
      label: "Approved",
      description: "Payment approved, ready to capture",
    },
    {
      value: PaymentStatus.COMPLETED,
      label: "Completed",
      description: "Payment successfully captured",
    },
    {
      value: PaymentStatus.FAILED,
      label: "Failed",
      description: "Payment failed",
    },
    {
      value: PaymentStatus.CANCELLED,
      label: "Cancelled",
      description: "Payment cancelled by user",
    },
    {
      value: PaymentStatus.EXPIRED,
      label: "Expired",
      description: "Payment session expired",
    },
    {
      value: PaymentStatus.REFUNDED,
      label: "Refunded",
      description: "Payment refunded",
    },
  ];

  // Return all statuses except the current one
  return allStatuses.filter((status) => status.value !== currentStatus);
}
