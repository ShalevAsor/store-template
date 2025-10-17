"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderWithItems } from "@/types/order";
import { formatPrice } from "@/utils/currencyUtils";
import { getTotalAmount } from "@/utils/orderUtils";
import { Package, ShoppingCart } from "lucide-react";

interface OrderItemsCardProps {
  order: OrderWithItems;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ order }) => {
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Items ({order.orderItems.length} products, {totalItems} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium">{item.productName}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-500">
                    <ShoppingCart className="h-3 w-3 inline mr-1" />
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Unit Price: {formatPrice(item.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-lg">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <p className="text-xs text-gray-500">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
            </div>
          ))}

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Subtotal ({totalItems} items)
              </span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>

            {order.shippingAmount && order.shippingAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {formatPrice(order.shippingAmount)}
                </span>
              </div>
            )}

            {order.taxAmount && order.taxAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {formatPrice(order.taxAmount)}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center font-semibold text-xl">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            {order.paidAmount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Amount Paid</span>
                <span
                  className={`font-medium ${
                    order.paidAmount === totalAmount
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {formatPrice(order.paidAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
