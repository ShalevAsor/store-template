import { StockAdjustment } from "./stock";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Generic action result type for all the server actions
 */
export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  // Only for checkout
  needsConfirmation?: boolean;
  stockIssues?: StockAdjustment[];
  adjustedTotal?: number;
  // add more optional fields when needed
};
