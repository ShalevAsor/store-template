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
