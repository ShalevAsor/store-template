"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

export const CartSummary: React.FC = () => {
  const { getTotalItems, getTotalPrice, clearCart } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      <div className="space-y-3">
        {/* Items Count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({totalItems})</span>
          <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
        </div>

        <hr className="my-3" />

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button disabled={totalItems === 0} className="w-full" size="lg">
          Proceed to Checkout
        </Button>

        {totalItems > 0 && (
          <Button
            onClick={clearCart}
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        )}
      </div>
    </div>
  );
};
