"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderActionsDropdown } from "@/components/admin/orders/OrderActionsDropdown";
import { SerializedOrder } from "@/types/order";
import { formatPrice } from "@/utils/priceUtils";
import { formatDate } from "@/utils/time";

interface OrdersTableProps {
  orders: SerializedOrder[];
  onCancelOrder: (id: string, orderNumber: string) => void;
  onUpdateStatus: (id: string, orderNumber: string, newStatus: string) => void;
  onProcessRefund: (id: string, orderNumber: string, amount: number) => void;
}

export function OrdersTable({
  orders,
  onCancelOrder,
  onUpdateStatus,
  onProcessRefund,
}: OrdersTableProps) {
  const getOrderStatusBadge = (status: string) => {
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
        return (
          <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "PROCESSING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
        );
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "REFUNDED":
        return (
          <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemsDisplay = (order: SerializedOrder) => {
    const itemCount = order.orderItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const uniqueProducts = order.orderItems.length;

    if (uniqueProducts === 1) {
      return `${itemCount} item${itemCount > 1 ? "s" : ""}`;
    }

    return `${itemCount} items (${uniqueProducts} products)`;
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No orders found
        </h3>
        <p className="text-gray-600 mb-4">
          Orders will appear here once customers start purchasing.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Order Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          return (
            <TableRow key={order.id}>
              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {order.id.slice(-8)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {order.customerEmail}
                  </div>
                  {order.customerPhone && (
                    <div className="text-xs text-gray-500">
                      {order.customerPhone}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-900">
                  {getItemsDisplay(order)}
                </div>
                <div className="text-xs text-gray-500">
                  {order.orderItems[0]?.productName}
                  {order.orderItems.length > 1 && (
                    <span> +{order.orderItems.length - 1} more</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="font-medium">
                  {formatPrice(order.totalAmount)}
                </div>
              </TableCell>

              <TableCell>{getOrderStatusBadge(order.status)}</TableCell>

              <TableCell>
                {getPaymentStatusBadge(order.paymentStatus)}
              </TableCell>

              <TableCell>
                <Badge variant={order.isDigital ? "secondary" : "default"}>
                  {order.isDigital ? "Digital" : "Physical"}
                </Badge>
              </TableCell>

              <TableCell className="text-gray-500 text-sm">
                {formatDate(order.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <OrderActionsDropdown
                  order={order}
                  isDetailPage={false} // Explicitly set for table view
                  onCancel={() => onCancelOrder(order.id, order.orderNumber)}
                  onUpdateStatus={(newStatus) =>
                    onUpdateStatus(order.id, order.orderNumber, newStatus)
                  }
                  onRefund={() =>
                    onProcessRefund(
                      order.id,
                      order.orderNumber,
                      order.totalAmount
                    )
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
