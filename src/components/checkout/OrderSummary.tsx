"use client";

import { useCartStore } from "@/store/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isDigitalOrder } from "@/utils/orderUtils";
import Image from "next/image";

export const OrderSummary: React.FC = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  // Determine if order is digital
  const orderIsDigital = isDigitalOrder(items);

  const subtotal = getTotalPrice();
  const shipping = orderIsDigital ? 0 : subtotal > 50 ? 0 : 10; // No shipping for digital, free shipping over $50 for physical
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

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
          {orderIsDigital && (
            <span className="text-blue-600 font-medium">📱 Digital Order</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
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
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>

              {/* Item Total */}
              <div className="text-sm font-medium text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {orderIsDigital ? (
                <span className="text-blue-600">Digital - No shipping</span>
              ) : shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping/Delivery Info */}
        <div
          className={`${
            orderIsDigital
              ? "bg-blue-50 border-blue-200"
              : "bg-green-50 border-green-200"
          } border rounded-md p-3`}
        >
          <p
            className={`text-sm ${
              orderIsDigital ? "text-blue-700" : "text-green-700"
            }`}
          >
            {orderIsDigital
              ? "🎉 Digital products will be delivered instantly to your email!"
              : shipping === 0
              ? "🎉 You qualify for free shipping!"
              : `Add ${(50 - subtotal).toFixed(2)} more for free shipping`}
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
                {orderIsDigital ? "Digital" : "Physical"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Delivery:</span>
              <span className="ml-1 font-medium">
                {orderIsDigital ? "Instant" : "Standard"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
