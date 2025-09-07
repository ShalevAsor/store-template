"use client";

import { useCartStore } from "@/store/cartStore";
import { useHydration } from "@/hooks/use-hydration";
import { CartItemComponent } from "@/components/cart/CartItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CartItems() {
  const { items } = useCartStore();
  const hasHydrated = useHydration();
  const router = useRouter();

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show empty state after hydration confirms cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <EmptyState variant="cart" onAction={() => router.push("/products")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <CartItemComponent key={item.id} item={item} />
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/products")}
          className="w-full sm:w-auto"
        >
          ← Continue Shopping
        </Button>
      </div>
    </div>
  );
}
