import { Metadata } from "next";
import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Shopping Cart | Your Store",
  description: "Review items in your shopping cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Shopping Cart"
        description="Review your items and proceed to checkout when ready."
        className="mb-8"
      />

      {/* Main Cart Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <CartItems />
        </div>

        {/* Cart Summary Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
