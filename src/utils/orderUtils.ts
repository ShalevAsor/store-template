import { CartItem } from "@/types/cart";

// Helper function to check if order is digital
export const isDigitalOrder = (items: CartItem[]): boolean => {
  return items.every((item) => item.isDigital);
};

export const formatOrderId = (id: string) => {
  return `#${id.slice(-8).toUpperCase()}`;
};

export const formatOrderDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
