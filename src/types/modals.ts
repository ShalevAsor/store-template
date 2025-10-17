import { OrderStatus, PaymentStatus } from "@prisma/client";
import { CartItem } from "./cart";
import { StockAdjustment } from "./stock";

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
export interface ConfirmActionData {
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface StatusSelectionData {
  title: string;
  currentStatus: OrderStatus | PaymentStatus;
  availableStatuses: Array<{
    value: OrderStatus | PaymentStatus;
    label: string;
    description?: string;
  }>;
  onConfirm: (newStatus: OrderStatus | PaymentStatus) => Promise<void>;
  onCancel?: () => void;
}

export interface RefundModalData {
  orderNumber: string;
  orderId: string;
  totalAmount: number;
  alreadyRefunded: number;
  onConfirm: (amount?: number, reason?: string) => Promise<void>;
  onCancel?: () => void;
}
