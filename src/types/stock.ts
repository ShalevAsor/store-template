import { CartItem } from "@/types/cart";

/**
 * Stock confirmation modal specific data
 */
export interface StockConfirmationData {
  stockAdjustments: StockAdjustment[];
  originalCartItems: CartItem[];
  originalTotal: number;
  adjustedTotal: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/**
 * Stock adjustment data structure
 */
export interface StockAdjustment {
  productId: string;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
  action: "reduced" | "removed";
}
