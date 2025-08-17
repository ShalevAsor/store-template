import { create } from "zustand";

// Cart item type
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
// State type
type CartState = {
  items: CartItem[];
};
// Actions type
type CartActions = {
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState & CartActions>((set, get) => ({
  // initial state
  items: [],
  // actions
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { ...product, quantity: 1 }],
      };
    }),
  removeItem: (id) =>
    set((state) => {
      return { items: state.items.filter((item) => item.id !== id) };
    }),
  updateQuantity: (id, quantity) =>
    set((state) => {
      return {
        items:
          quantity === 0
            ? state.items.filter((item) => item.id !== id)
            : state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
              ),
      };
    }),
  clearCart: () => set({ items: [] }),
  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
