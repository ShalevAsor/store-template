"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { SerializedOrder } from "@/types/order";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface CustomerInfoCardProps {
  order: SerializedOrder;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  order,
}) => {
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

        {order.customerPhone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">{order.customerPhone}</p>
              <p className="text-sm text-gray-500">Phone</p>
            </div>
          </div>
        )}

        {order.shippingAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <div>
              <p className="font-medium">Shipping Address</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
