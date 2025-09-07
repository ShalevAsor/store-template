"use client";

import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/types/cart";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatLineItemPrice } from "@/utils/priceUtils";

interface CartItemProps {
  item: CartItem;
}

export const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem, addItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    // Store the item data for potential restore
    const itemToRestore = { ...item };

    removeItem(item.id);

    toast.success(`${item.name} removed from cart`, {
      action: {
        label: "Undo",
        onClick: () => {
          addItem(
            {
              id: itemToRestore.id,
              name: itemToRestore.name,
              price: itemToRestore.price,
              image: itemToRestore.image,
              isDigital: itemToRestore.isDigital,
            },
            itemToRestore.quantity
          );
          toast.success("Item restored to cart");
        },
      },
    });
  };

  // Use centralized price formatting
  const lineItemPrice = formatLineItemPrice(item.price, item.quantity);

  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
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

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">
                {item.name}
              </h3>
              {item.isDigital && (
                <Badge variant="secondary" className="text-xs">
                  Digital
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {lineItemPrice.unitPrice} each
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="w-12 text-center">
              <span className="font-medium">{item.quantity}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Line Total */}
          <div className="text-right min-w-[80px]">
            <p className="font-semibold text-gray-900">
              {lineItemPrice.lineTotal}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
