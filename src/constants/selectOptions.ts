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
