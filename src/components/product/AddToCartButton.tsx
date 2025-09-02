"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { SerializedProduct } from "@/types/product";
import { useProductStock } from "@/hooks/use-product-stock";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/shared/Badge";
import { toast } from "sonner";

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

  // Get stock data and cart methods
  const { data: stockData, isLoading: isLoadingStock } = useProductStock([
    product.id,
  ]);
  const { addItem, getItemQuantity } = useCartStore();

  // Calculate stock info
  const stock = stockData?.[product.id] ?? null;
  const currentInCart = getItemQuantity(product.id);
  const availableToAdd =
    product.isDigital || stock === null
      ? Infinity
      : Math.max(0, stock - currentInCart);
  const isOutOfStock =
    !product.isDigital && stock !== null && stock <= currentInCart;
  const maxQuantity =
    product.isDigital || stock === null
      ? 999
      : Math.max(0, stock - currentInCart);

  // For simple variant, always use quantity 1
  const finalQuantity = variant === "simple" ? 1 : quantity;
  const canAddCurrentQuantity = availableToAdd >= finalQuantity;

  const handleAddToCart = async () => {
    // Don't allow adding while stock is loading
    if (isLoadingStock) {
      toast.error("Please wait, checking availability...");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (!canAddCurrentQuantity) {
      toast.error(`Only ${availableToAdd} more available`);
      return;
    }

    setIsLoading(true);

    try {
      const result = addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.imageUrl,
          isDigital: product.isDigital,
        },
        finalQuantity,
        stock
      );

      if (result.success) {
        toast.success(result.message);
        // Reset quantity to 1 after successful add (for detailed variant)
        if (variant === "detailed") {
          setQuantity(1);
        }
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    if (newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
      toast.warning(`Only ${maxQuantity} available`);
      return;
    }

    setQuantity(newQuantity);
  };

  // Button text logic
  const getButtonText = () => {
    if (isLoading) return "Adding...";
    if (isOutOfStock) return "Out of Stock";
    if (availableToAdd === 0) return "Already in Cart";

    if (variant === "simple") {
      return "Add to Cart";
    }

    return `Add to Cart - $${(product.price * finalQuantity).toFixed(2)}`;
  };

  const isDisabled =
    isLoading || isLoadingStock || isOutOfStock || availableToAdd === 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stock Status Display - for detailed variant only */}
      {variant === "detailed" && !product.isDigital && (
        <div className="text-sm">
          {product.stock === null ? (
            <Badge type="stock">In Stock</Badge>
          ) : product.stock > 0 ? (
            <div className="space-y-1">
              <Badge type="stock">{product.stock} available</Badge>
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

      {/* Quantity Selector - for detailed variant only */}
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
              disabled={isDisabled || quantity >= maxQuantity}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Quantity validation message */}
          {!canAddCurrentQuantity && availableToAdd > 0 && (
            <span className="text-amber-600 text-sm">
              Only {availableToAdd} available
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled || !canAddCurrentQuantity}
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
