"use client";

import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/types/cart";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
// Import centralized price utilities
import {
  formatPrice,
  formatLineItemPrice,
  getDetailedStockText,
} from "@/utils/priceUtils";

interface CartItemProps {
  item: CartItem;
  productStock?: number | null;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  productStock = null,
}) => {
  const { updateQuantity, removeItem, addItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;

    // For physical products, validate against stock
    if (
      !item.isDigital &&
      productStock !== null &&
      newQuantity > productStock
    ) {
      toast.error(`Only ${productStock} available in stock`);
      return;
    }

    const result = updateQuantity(item.id, newQuantity, productStock);

    if (!result.success) {
      toast.error(result.message);
    }
  };

  const handleRemove = () => {
    // Store the item data before removing
    const itemToRestore = { ...item };

    removeItem(item.id);
    toast.success(`${item.name} removed from cart`, {
      action: {
        label: "Undo",
        onClick: () => {
          // Actually re-add the item with proper stock validation
          const result = addItem(
            {
              id: itemToRestore.id,
              name: itemToRestore.name,
              price: itemToRestore.price,
              image: itemToRestore.image,
              isDigital: itemToRestore.isDigital,
            },
            itemToRestore.quantity,
            productStock
          );

          if (result.success) {
            toast.success("Item restored to cart");
          } else {
            toast.error(result.message);
          }
        },
      },
    });
  };

  // Calculate max quantity for this item
  const getMaxQuantity = () => {
    if (item.isDigital || productStock === null) return 999;
    return productStock;
  };

  const maxQuantity = getMaxQuantity();
  const isAtMaxQuantity = item.quantity >= maxQuantity;

  // Use centralized price formatting
  const lineItemPrice = formatLineItemPrice(item.price, item.quantity);
  const stockText = getDetailedStockText(productStock, item.isDigital);

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
      {/* Product image */}
      {item.image && (
        <div className="flex-shrink-0">
          <Image
            className="w-20 h-20 object-cover rounded-md"
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
          />
        </div>
      )}

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
          {item.isDigital && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Digital
            </span>
          )}
        </div>
        {/* Use centralized price formatting */}
        <p className="text-sm text-gray-500">{lineItemPrice.unitPrice} each</p>

        {/* Stock info using centralized text */}
        {!item.isDigital && productStock !== null && (
          <p className="text-xs text-gray-400 mt-1">{stockText}</p>
        )}
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-8 w-8 p-0"
        >
          <Minus className="w-4 h-4" />
        </Button>

        <div className="w-12 text-center">
          <span className="font-medium">{item.quantity}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isAtMaxQuantity}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Item Total - Using centralized formatting */}
      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-gray-900">{lineItemPrice.lineTotal}</p>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
};
