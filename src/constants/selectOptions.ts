import type { SelectOption } from "@/components/shared/FilterSelect";

/**
 * Predefined option sets for common select use cases
 * This keeps options consistent across the application
 */

// Product type options
export const PRODUCT_TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Products" },
  { value: "physical", label: "Physical Products" },
  { value: "digital", label: "Digital Products" },
];

// Product status used in admin products page

export const PRODUCT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

// Order type options
export const ORDER_TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Orders" },
  { value: "digital_only", label: "Digital Only" },
  { value: "has_physical", label: "Has Physical Items" },
];

// Order status options
export const ORDER_STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

// Payment status options
export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Payment Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];
