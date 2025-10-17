"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { OrderWithItems } from "@/types/order";
import { getShippingAddress } from "@/utils/orderUtils";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface CustomerInfoCardProps {
  order: OrderWithItems;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  order,
}) => {
  const shippingAddress = getShippingAddress(order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-gray-500">Customer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium">{order.customerEmail}</p>
            <p className="text-sm text-gray-500">Email</p>
          </div>
        </div>

        {order.payerEmail && order.payerEmail !== order.customerEmail && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-amber-500" />
            <div>
              <p className="font-medium text-amber-700">{order.payerEmail}</p>
              <p className="text-sm text-amber-600">
                Payer Email (Different from customer)
              </p>
            </div>
          </div>
        )}

        {order.customerPhone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">{order.customerPhone}</p>
              <p className="text-sm text-gray-500">Phone</p>
            </div>
          </div>
        )}

        {shippingAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <div>
              <p className="font-medium">Shipping Address</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {shippingAddress}
              </p>
            </div>
          </div>
        )}

        {order.isDigital && !shippingAddress && (
          <div className="flex items-center gap-3 text-gray-500">
            <MapPin className="h-4 w-4" />
            <div>
              <p className="text-sm">No shipping address required</p>
              <p className="text-xs text-gray-400">Digital order</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
