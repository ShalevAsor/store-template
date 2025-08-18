"use client";

import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/types/cart";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash } from "lucide-react";

interface CartItemProps {
  item: CartItem;
}

export const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

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
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          ${item.price.toFixed(2)} each
        </p>
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
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Item Total */}
      <div className="text-right min-w-[80px]">
        <p className="font-semibold text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
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
