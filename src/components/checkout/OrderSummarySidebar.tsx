import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPrice } from "@/utils/currencyUtils";
import { OrderWithItems } from "@/types/order";

interface OrderSummarySidebarProps {
  order: OrderWithItems;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  order,
}) => {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.shippingAmount && order.shippingAmount > 0 ? (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">
                  {formatPrice(order.shippingAmount)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(order.taxAmount || 0)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>
                  {formatPrice(
                    order.subtotal +
                      (order.shippingAmount || 0) +
                      (order.taxAmount || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
