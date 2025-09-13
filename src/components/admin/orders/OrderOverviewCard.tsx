"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SerializedOrder } from "@/types/order";
import { OrderActionsDropdown } from "./OrderActionsDropdown";
import { formatPrice } from "@/utils/priceUtils";
import { useOrderActions } from "@/hooks/use-order-actions";
import { Package, Calendar, Clock, CreditCard } from "lucide-react";
import {
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from "@/components/shared/OrderBadges";
import { formatDate } from "@/utils/time";

interface OrderOverviewCardProps {
  order: SerializedOrder;
}

export const OrderOverviewCard: React.FC<OrderOverviewCardProps> = ({
  order,
}) => {
  const { handleCancelOrder, handleUpdateStatus, handleProcessRefund } =
    useOrderActions();

  const totalItems = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              Order {order.orderNumber}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                {getOrderStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Payment:</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Type:</span>
                <Badge variant={order.isDigital ? "secondary" : "default"}>
                  {order.isDigital ? "Digital" : "Physical"}
                </Badge>
              </div>
            </div>
          </div>
          <OrderActionsDropdown
            order={order}
            isDetailPage={true}
            onCancel={() => handleCancelOrder(order.id, order.orderNumber)}
            onUpdateStatus={(newStatus) =>
              handleUpdateStatus(order.id, order.orderNumber, newStatus)
            }
            onRefund={() =>
              handleProcessRefund(
                order.id,
                order.orderNumber,
                order.totalAmount
              )
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium">{formatDate(order.updatedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Items</p>
              <p className="font-medium">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium text-lg">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
