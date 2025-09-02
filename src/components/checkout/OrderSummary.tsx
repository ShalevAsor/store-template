"use client";

import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
// Import centralized price utilities
import {
  calculateOrderTotals,
  formatLineItemPrice,
  getShippingDisplayText,
  getFreeShippingMessage,
} from "@/utils/priceUtils";

export const OrderSummary: React.FC = () => {
  const { items, getTotalItems } = useCartStore();

  // Use centralized calculation instead of manual calculations
  const orderTotals = calculateOrderTotals(items);
  const shippingDisplay = getShippingDisplayText(items, orderTotals.shipping);
  const freeShippingMessage = getFreeShippingMessage(
    items,
    orderTotals.subtotal
  );

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{getTotalItems()} item(s)</span>
          {orderTotals.isDigital && (
            <span className="text-blue-600 font-medium">📱 Digital Order</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => {
            // Use centralized price formatting for each item
            const itemPrice = formatLineItemPrice(item.price, item.quantity);

            return (
              <div key={item.id} className="flex items-center gap-3">
                {/* Product Image */}
                {item.image && (
                  <div className="flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="w-12 h-12 object-cover rounded-md border"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </h4>
                    {item.isDigital && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Digital
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {itemPrice.formattedLine}
                  </p>
                </div>

                {/* Item Total */}
                <div className="text-sm font-medium text-gray-900">
                  {itemPrice.lineTotal}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Order Totals - Using centralized calculations */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {orderTotals.formatted.subtotal}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className={`font-medium ${shippingDisplay.className}`}>
              {shippingDisplay.text}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">{orderTotals.formatted.tax}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{orderTotals.formatted.total}</span>
          </div>
        </div>

        {/* Shipping/Delivery Info */}
        <div
          className={`${
            orderTotals.isDigital
              ? "bg-blue-50 border-blue-200"
              : "bg-green-50 border-green-200"
          } border rounded-md p-3`}
        >
          <p
            className={`text-sm ${
              orderTotals.isDigital ? "text-blue-700" : "text-green-700"
            }`}
          >
            {freeShippingMessage}
          </p>
        </div>

        {/* Order Type Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Order Details
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Order Type:</span>
              <span className="ml-1 font-medium">
                {orderTotals.isDigital ? "Digital" : "Physical"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Delivery:</span>
              <span className="ml-1 font-medium">
                {orderTotals.isDigital ? "Instant" : "Standard"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
