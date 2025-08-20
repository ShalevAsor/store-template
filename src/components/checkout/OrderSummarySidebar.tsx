import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface OrderSummarySidebarProps {
  totalAmount: number;
  isDigital: boolean;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  totalAmount,
  isDigital,
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
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            {!isDigital && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
