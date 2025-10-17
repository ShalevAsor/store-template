import { CheckoutFormData } from "@/schemas/checkoutSchema";
import { Order, OrderItem, OrderStatus, PaymentStatus } from "@prisma/client";
import { PaginationMeta } from "./common";

export type OrderStatusFilter = OrderStatus | "all";
export type OrderTypeFilter = "digital_only" | "has_physical" | "all";
export type PaymentStatusFilter = PaymentStatus | "all";

export interface OrderSearchFilters {
  search?: string; // Search by order number, customer name, email, or phone
  status?: OrderStatusFilter;
  type?: OrderTypeFilter; // Better than isDigital boolean
  paymentStatus?: PaymentStatusFilter;
}
export interface CreateOrderData extends CheckoutFormData {
  isDigital: boolean; // Calculated from cart items
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
}

export type OrderWithItems = Order & {
  orderItems: OrderItem[];
};

export type OrdersPaginationResult = {
  orders: OrderWithItems[];
  pagination: PaginationMeta;
};

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isDigital: boolean;
  // Formatted versions for display
  formatted: {
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
  };
  // Helper properties
  qualifiesForFreeShipping: boolean;
  amountNeededForFreeShipping: number;
}

export { OrderStatus, PaymentStatus };
