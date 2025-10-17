"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderWithItems } from "@/types/order";
import { OrderActionsDropdown } from "./OrderActionsDropdown";
import { formatPrice } from "@/utils/currencyUtils";
import { useOrderActions } from "@/hooks/use-order-actions";
import { Package, Calendar, Clock, CreditCard, DollarSign } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import {
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from "@/utils/statusUtils";
import { getTotalAmount } from "@/utils/orderUtils";

interface OrderOverviewCardProps {
  order: OrderWithItems;
}

export const OrderOverviewCard: React.FC<OrderOverviewCardProps> = ({
  order,
}) => {
  const {
    handleChangeOrderStatus,
    handleChangePaymentStatus,
    handleProcessRefund,
    handleCancelOrder,
  } = useOrderActions();

  const totalItems = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalAmount = getTotalAmount(
    order.subtotal,
    order.shippingAmount,
    order.taxAmount
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        {/* Header with actions always on the right */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <Package className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Order {order.orderNumber}</span>
            </CardTitle>
          </div>

          {/* Actions - Always top right */}
          <div className="flex-shrink-0">
            <OrderActionsDropdown
              order={order}
              isDetailPage={true}
              onChangeOrderStatus={() =>
                handleChangeOrderStatus(
                  order.id,
                  order.orderNumber,
                  order.status
                )
              }
              onChangePaymentStatus={() =>
                handleChangePaymentStatus(
                  order.id,
                  order.orderNumber,
                  order.paymentStatus
                )
              }
              onProcessRefund={() =>
                handleProcessRefund(
                  order.id,
                  order.orderNumber,
                  totalAmount,
                  order.refundAmount || 0
                )
              }
              onCancelOrder={() =>
                handleCancelOrder(order.id, order.orderNumber)
              }
            />
          </div>
        </div>

        {/* IDs Section - Responsive layout */}
        <div className="text-xs text-gray-500 mb-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>ID: {order.id.slice(-8)}</span>
            {order.paymentId && (
              <span>Payment ID: {order.paymentId.slice(-8)}</span>
            )}
            {order.transactionId && (
              <span>Transaction ID: {order.transactionId.slice(-8)}</span>
            )}
          </div>
        </div>

        {/* Status Badges - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Status:
            </span>
            {getOrderStatusBadge(order.status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Payment:
            </span>
            {getPaymentStatusBadge(order.paymentStatus)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Type:
            </span>
            <Badge variant={order.isDigital ? "secondary" : "default"}>
              {order.isDigital ? "Digital" : "Physical"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Grid - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium truncate">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                {order.paidAt ? "Paid Date" : "Last Updated"}
              </p>
              <p className="font-medium truncate">
                {order.paidAt
                  ? formatDate(order.paidAt)
                  : formatDate(order.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">Items</p>
              <p className="font-medium">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-semibold text-lg text-blue-600 truncate">
                {formatPrice(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment amount discrepancy warning */}
        {order.paidAmount && order.paidAmount !== totalAmount && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Payment Discrepancy
                </h4>
                <p className="text-sm text-amber-700">
                  Paid amount ({formatPrice(order.paidAmount)}) differs from
                  order total ({formatPrice(totalAmount)})
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
