"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderWithItems } from "@/types/order";
import { formatPrice } from "@/utils/currencyUtils";
import { formatDate } from "@/utils/dateUtils";
import { getPaymentStatusBadge } from "@/utils/statusUtils";
import {
  CreditCard,
  Calendar,
  Hash,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { getTotalAmount } from "@/utils/orderUtils";

interface PaymentInfoCardProps {
  order: OrderWithItems;
}

export const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({ order }) => {
  const totalAmount = getTotalAmount(
    order.subtotal,
    order.shippingAmount,
    order.taxAmount
  );
  const hasPaymentDiscrepancy =
    order.paidAmount && order.paidAmount !== totalAmount;

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
          <Badge variant="outline">{order.paymentMethod}</Badge>
          {order.paymentProviderId && (
            <span className="text-sm text-gray-500">
              Payment Provider:{order.paymentProviderId}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Payment Status</span>
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>

        {order.paidAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Paid Date
            </span>
            <span className="font-medium">{formatDate(order.paidAt)}</span>
          </div>
        )}

        {order.paymentId && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Payment ID
            </span>
            <span className="font-mono text-sm">{order.paymentId}</span>
          </div>
        )}

        {order.transactionId && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              Transaction ID
            </span>
            <span className="font-mono text-sm">{order.transactionId}</span>
          </div>
        )}
        {/* TODO: change from order.refundAmount to order.refundId */}
        {order.refundId && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              Refund ID
            </span>
            <span className="font-mono text-sm">{order.refundId}</span>
          </div>
        )}
        {order.refundAmount && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Refund Amount
            </span>
            <span className="font-medium">
              {formatPrice(order.refundAmount)}
            </span>
          </div>
        )}
        {order.refundedAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Refund Date
            </span>
            <span className="font-medium">{formatDate(order.refundedAt)}</span>
          </div>
        )}

        <Separator />

        {/* Amount Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>

          {order.shippingAmount && order.shippingAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Shipping</span>
              <span className="font-medium">
                {formatPrice(order.shippingAmount)}
              </span>
            </div>
          )}

          {order.taxAmount && order.taxAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Tax</span>
              <span className="font-medium">
                {formatPrice(order.taxAmount)}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          {order.paidAmount && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Amount Paid</span>
              <span
                className={`font-medium ${
                  hasPaymentDiscrepancy ? "text-amber-600" : "text-green-600"
                }`}
              >
                {formatPrice(order.paidAmount)}
              </span>
            </div>
          )}

          {hasPaymentDiscrepancy && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Difference
              </span>
              <span className="font-medium text-amber-600">
                {formatPrice(Math.abs(totalAmount - order.paidAmount!))}
                {order.paidAmount! > totalAmount
                  ? " (Overpaid)"
                  : " (Underpaid)"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
