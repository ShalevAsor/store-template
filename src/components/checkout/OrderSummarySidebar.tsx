import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatPrice } from "@/utils/priceUtils";
import { calculateTax } from "@/utils/orderUtils";

interface OrderSummarySidebarProps {
  totalAmount: number;
  isDigital: boolean;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  totalAmount,
  isDigital,
}) => {
  // Use centralized tax calculation
  const tax = calculateTax(totalAmount);
  const total = totalAmount + tax;

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
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {!isDigital && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
