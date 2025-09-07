"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { SerializedProduct } from "@/types/product";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/images";
import { useHydration } from "@/hooks/use-hydration";

interface AddToCartButtonProps {
  product: SerializedProduct;
  variant?: "simple" | "detailed";
  className?: string;
  buttonSize?: "sm" | "default" | "lg";
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant = "detailed",
  className = "",
  buttonSize = "default",
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const hydrated = useHydration();
  const { addItem, getItemQuantity } = useCartStore();

  // Get current cart quantity (only after hydration)
  const currentInCart = hydrated ? getItemQuantity(product.id) : 0;

  // Determine if product is truly out of stock (hard block)
  const isOutOfStock = product.stock === 0;

  // For simple variant, always use quantity 1
  const finalQuantity = variant === "simple" ? 1 : quantity;

  const handleAddToCart = () => {
    setIsLoading(true);

    // Add to cart without validation - just add whatever user wants
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: getImageUrl(product.images[0]?.imageKey),
        isDigital: product.isDigital,
      },
      finalQuantity
    );

    // Show success message
    const message =
      finalQuantity === 1
        ? `${product.name} added to cart`
        : `${finalQuantity} × ${product.name} added to cart`;

    toast.success(message);

    // Reset quantity to 1 after successful add (for detailed variant)
    if (variant === "detailed") {
      setQuantity(1);
    }

    setIsLoading(false);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  // Button text logic
  const getButtonText = () => {
    if (isLoading) return "Adding...";
    if (isOutOfStock) return "Out of Stock";

    if (variant === "simple") {
      return "Add to Cart";
    }

    return `Add to Cart - $${(product.price * finalQuantity).toFixed(2)}`;
  };

  // Only disable for truly out of stock items or while loading
  const isDisabled = isLoading || isOutOfStock;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stock Status Display - for detailed variant only */}
      {variant === "detailed" && !product.isDigital && (
        <div className="text-sm">
          {product.stock === null ? (
            <Badge variant="secondary">In Stock</Badge>
          ) : product.stock > 0 ? (
            <div className="space-y-1">
              <Badge variant="secondary">{product.stock} available</Badge>
              {currentInCart > 0 && (
                <span className="text-gray-500 block">
                  ({currentInCart} already in cart)
                </span>
              )}
            </div>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      )}

      {/* Quantity Selector - for detailed variant only, hide if out of stock */}
      {variant === "detailed" && !isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isDisabled}
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
              disabled={isDisabled}
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
        disabled={isDisabled}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
        size={buttonSize}
      >
        {variant === "detailed" && <ShoppingCart className="w-5 h-5 mr-2" />}
        {getButtonText()}
      </Button>

      {/* Digital Product Note - for detailed variant only */}
      {variant === "detailed" && product.isDigital && (
        <p className="text-sm text-blue-600 text-center">
          Digital product - instant delivery after purchase
        </p>
      )}
    </div>
  );
};
