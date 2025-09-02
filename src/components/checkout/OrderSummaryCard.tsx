"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { CartItem } from "@/types/cart";
import { SerializedOrderItem } from "@/lib/orders";
// Import centralized price utilities
import {
  calculateOrderTotals,
  formatLineItemPrice,
  getShippingDisplayText,
  getFreeShippingMessage,
  formatPrice,
} from "@/utils/priceUtils";

interface OrderSummaryCardProps {
  // For checkout page - pass cart items
  cartItems?: CartItem[];
  totalItemCount?: number;

  // For success page - pass order data
  orderItems?: SerializedOrderItem[];
  orderTotal?: number;
  isDigital?: boolean;

  // Styling variants
  variant?: "checkout" | "success";
  showItemDetails?: boolean;
  className?: string;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  cartItems = [],
  totalItemCount,
  orderItems = [],
  orderTotal,
  isDigital,
  variant = "checkout",
  showItemDetails = true,
  className = "",
}) => {
  // Determine data source and calculate totals
  const isCheckoutMode = variant === "checkout" && cartItems.length > 0;
  const isSuccessMode = variant === "success" && orderItems.length > 0;

  let orderTotals;
  let items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    isDigital: boolean;
  }> = [];
  let itemCount = 0;

  if (isCheckoutMode) {
    // Checkout mode - use cart data
    orderTotals = calculateOrderTotals(cartItems);
    items = cartItems;
    itemCount =
      totalItemCount || cartItems.reduce((sum, item) => sum + item.quantity, 0);
  } else if (isSuccessMode) {
    // Success mode - reconstruct from order data
    items = orderItems.map((item) => ({
      id: item.id,
      name: item.productName,
      price: item.price,
      quantity: item.quantity,
      isDigital: isDigital || false, // Assume all items have same digital status for simplicity
    }));

    // Calculate totals from order items (more accurate than using passed orderTotal)
    const cartLikeItems: CartItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      isDigital: item.isDigital,
    }));

    orderTotals = calculateOrderTotals(cartLikeItems);
    itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  } else {
    // Empty state
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {variant === "success" ? (
              <CreditCard className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            {variant === "checkout"
              ? "Your cart is empty"
              : "No order data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const shippingDisplay = getShippingDisplayText(
    cartItems,
    orderTotals.shipping
  );
  const freeShippingMessage = getFreeShippingMessage(
    cartItems,
    orderTotals.subtotal
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {variant === "success" ? (
            <CreditCard className="w-5 h-5" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
          Order Summary
        </CardTitle>
        {variant === "checkout" && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{itemCount} item(s)</span>
            {orderTotals.isDigital && (
              <span className="text-blue-600 font-medium">
                📱 Digital Order
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Item Details - Only show in checkout mode or when explicitly requested */}
        {showItemDetails && variant === "checkout" && (
          <>
            <div className="space-y-3">
              {items.map((item) => {
                const itemPrice = formatLineItemPrice(
                  item.price,
                  item.quantity
                );

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
          </>
        )}

        {/* Order Totals - Always use centralized calculations */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {orderTotals.formatted.subtotal}
            </span>
          </div>

          {!orderTotals.isDigital && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className={`font-medium ${shippingDisplay.className}`}>
                {shippingDisplay.text}
              </span>
            </div>
          )}

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

        {/* Free Shipping Message - Only in checkout mode */}
        {variant === "checkout" && (
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
        )}

        {/* Order Type Summary - Only in checkout mode */}
        {variant === "checkout" && (
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
        )}
      </CardContent>
    </Card>
  );
};
