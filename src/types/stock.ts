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
