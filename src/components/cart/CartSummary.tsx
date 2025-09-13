"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHydration } from "@/hooks/use-hydration";
import { calculateOrderTotals } from "@/utils/orderUtils";

export const CartSummary: React.FC = () => {
  const { items, getTotalItems, clearCart } = useCartStore();
  const router = useRouter();
  const hydrated = useHydration();

  // Use empty array until hydrated to prevent mismatch
  const safeItems = hydrated ? items : [];
  const totalItems = hydrated ? getTotalItems() : 0;
  const orderTotals = calculateOrderTotals(safeItems);

  // Don't render until hydrated to prevent mismatch
  if (!hydrated) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      <div className="space-y-3">
        {/* Items Count - Using centralized formatting */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({totalItems})</span>
          <span className="text-gray-900">
            {orderTotals.formatted.subtotal}
          </span>
        </div>

        <hr className="my-3" />

        {/* Total - Using centralized formatting */}
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{orderTotals.formatted.subtotal}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Button
          onClick={() => {
            router.push("/checkout");
          }}
          disabled={totalItems === 0}
          className="w-full"
          size="lg"
        >
          Proceed to Checkout
        </Button>

        {totalItems > 0 && (
          <Button
            onClick={() => {
              clearCart();
              toast.success("Cart cleared!");
            }}
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
