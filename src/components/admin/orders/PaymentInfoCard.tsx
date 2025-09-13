"use client";

import { getPaymentStatusBadge } from "@/components/shared/OrderBadges";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SerializedOrder } from "@/types/order";
import { formatPrice } from "@/utils/priceUtils";
import { CreditCard } from "lucide-react";

interface PaymentInfoCardProps {
  order: SerializedOrder;
}

export const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({ order }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Payment Method</span>
          <span className="font-medium capitalize">{order.paymentMethod}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Payment Status</span>
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>

        <Separator />

        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
