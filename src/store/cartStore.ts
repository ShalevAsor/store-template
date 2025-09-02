import { CartItem } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Result type for cart operations
export interface CartOperationResult {
  success: boolean;
  message: string;
}

// State type
type CartState = {
  items: CartItem[];
};

// Actions type
type CartActions = {
  addItem: (
    product: Omit<CartItem, "quantity">,
    quantity?: number,
    stock?: number | null
  ) => CartOperationResult;
  updateQuantity: (
    id: string,
    quantity: number,
    stock?: number | null
  ) => CartOperationResult;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (id: string) => number;
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],

      // Add item with stock validation
      addItem: (product, quantity = 1, stock = null) => {
        const state = get();
        const existingItem = state.items.find((item) => item.id === product.id);
        const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
        const requestedTotalQuantity = currentQuantityInCart + quantity;

        // Stock validation for physical products (digital products have unlimited stock)
        if (
          !product.isDigital &&
          stock !== null &&
          requestedTotalQuantity > stock
        ) {
          const availableToAdd = Math.max(0, stock - currentQuantityInCart);

          if (availableToAdd <= 0) {
            return {
              success: false,
              message: "This item is out of stock",
            };
          }

          return {
            success: false,
            message: `Only ${availableToAdd} more available (${currentQuantityInCart} already in cart)`,
          };
        }

        // Update cart
        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { ...product, quantity }],
          };
        });

        return {
          success: true,
          message:
            quantity === 1
              ? `${product.name} added to cart`
              : `${quantity} × ${product.name} added to cart`,
        };
      },

      // Update quantity with stock validation
      updateQuantity: (id, quantity, stock = null) => {
        const state = get();
        const existingItem = state.items.find((item) => item.id === id);

        if (!existingItem) {
          return {
            success: false,
            message: "Item not found in cart",
          };
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
          return {
            success: true,
            message: "Item removed from cart",
          };
        }

        // Stock validation for physical products
        if (!existingItem.isDigital && stock !== null && quantity > stock) {
          return {
            success: false,
            message: `Only ${stock} available in stock`,
          };
        }

        // Update quantity
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));

        return {
          success: true,
          message: "Quantity updated",
        };
      },

      // Remove item (no validation needed)
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // Clear cart (no validation needed)
      clearCart: () => set({ items: [] }),

      // Get total items count
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get total price
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Get quantity of specific item
      getItemQuantity: (id) => {
        const { items } = get();
        const item = items.find((item) => item.id === id);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
