"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { SerializedProduct } from "@/lib/products";

interface AddToCartButtonProps {
  product: SerializedProduct;
  showQuantitySelector?: boolean;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  showQuantitySelector = true,
  className = "",
}) => {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Add multiple quantities if needed
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || undefined,
        isDigital: product.isDigital,
      });
    }

    // Brief loading state for better UX
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quantity Selector */}
      {showQuantitySelector && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>

            <div className="w-12 text-center">
              <span className="font-medium">{quantity}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {isAdding
          ? "Adding..."
          : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
      </Button>
    </div>
  );
};
