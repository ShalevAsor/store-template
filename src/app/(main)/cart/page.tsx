"use client";

import { useCartStore } from "@/store/cartStore";
import { CartItemComponent } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <EmptyState variant="cart" onAction={() => router.push("/products")} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-1">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemComponent key={item.id} item={item} />
            ))}
          </div>

          {/* Continue Shopping Link */}
          <div className="mt-6">
            <button
              onClick={() => router.push("/products")}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium underline"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
