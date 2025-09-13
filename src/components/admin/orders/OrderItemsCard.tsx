"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SerializedOrder } from "@/types/order";
import { formatPrice } from "@/utils/priceUtils";
import { Package } from "lucide-react";

interface OrderItemsCardProps {
  order: SerializedOrder;
}

export const OrderItemsCard: React.FC<OrderItemsCardProps> = ({ order }) => {
  const totalItems = order.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Items ({order.orderItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {order.orderItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium">{item.productName}</h4>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total ({totalItems} items)</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
