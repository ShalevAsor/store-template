import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatOrderDate, formatOrderId } from "@/utils/priceUtils";
import { formatPrice, formatLineItemPrice } from "@/utils/priceUtils";
import { MapPin, Package, User } from "lucide-react";
import { SerializedOrder } from "@/lib/orders";

interface OrderDetailsProps {
  order: SerializedOrder;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Order Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order Number</p>
              <p className="font-medium">{formatOrderId(order.id)}</p>
            </div>
            <div>
              <p className="text-gray-500">Order Date</p>
              <p className="font-medium">{formatOrderDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">
                {order.status.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Order Type</p>
              <p className="font-medium">
                {order.isDigital ? "Digital Products" : "Physical Products"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium capitalize">
                {order.paymentMethod.replace("_", " ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address (if not digital) */}
      {!order.isDigital && order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">
              {order.shippingAddress}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item) => {
              const itemPrice = formatLineItemPrice(item.price, item.quantity);

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{itemPrice.lineTotal}</p>
                    <p className="text-sm text-gray-500">
                      {itemPrice.unitPrice} each
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
