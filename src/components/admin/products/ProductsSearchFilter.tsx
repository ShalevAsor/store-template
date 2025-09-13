"use client";

import { SearchFilter, FilterConfig } from "@/components/shared/SearchFilter";
import {
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "@/constants/selectOptions";

interface ProductsSearchFilterProps {
  initialSearch?: string;
  initialProductType?: string;
  initialStatus?: string;
}

export const ProductsSearchFilter: React.FC<ProductsSearchFilterProps> = ({
  initialSearch = "",
  initialProductType = "all",
  initialStatus = "all",
}) => {
  // Configure filters for products
  const filters: FilterConfig[] = [
    {
      key: "productType",
      label: "Type",
      options: PRODUCT_TYPE_OPTIONS,
      placeholder: "Product type",
      className: "w-full sm:w-[140px]",
      ariaLabel: "Filter by product type",
    },
    {
      key: "status",
      label: "Status",
      options: PRODUCT_STATUS_OPTIONS,
      placeholder: "Status",
      className: "w-full sm:w-[120px]",
      ariaLabel: "Filter by status",
    },
  ];

  const initialValues = {
    search: initialSearch,
    productType: initialProductType,
    status: initialStatus,
  };

  return (
    <SearchFilter
      searchPlaceholder="Search products by name, description, SKU, or category..."
      filters={filters}
      initialValues={initialValues}
    />
  );
};
