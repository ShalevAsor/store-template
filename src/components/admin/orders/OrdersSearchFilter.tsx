// components/admin/orders/OrdersSearchFilter.tsx
"use client";

import { SearchFilter, FilterConfig } from "@/components/shared/SearchFilter";
import {
  ORDER_TYPE_OPTIONS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/constants/selectOptions";

interface OrdersSearchFilterProps {
  initialSearch?: string;
  initialType?: string;
  initialStatus?: string;
  initialPaymentStatus?: string;
}

export const OrdersSearchFilter: React.FC<OrdersSearchFilterProps> = ({
  initialSearch = "",
  initialType = "all",
  initialStatus = "all",
  initialPaymentStatus = "all",
}) => {
  // Configure filters for orders
  const filters: FilterConfig[] = [
    {
      key: "type",
      label: "Type",
      options: ORDER_TYPE_OPTIONS,
      placeholder: "Order type",
      className: "w-full sm:w-[140px]",
      ariaLabel: "Filter by order type",
    },
    {
      key: "status",
      label: "Status",
      options: ORDER_STATUS_OPTIONS,
      placeholder: "Order status",
      className: "w-full sm:w-[120px]",
      ariaLabel: "Filter by order status",
    },
    {
      key: "paymentStatus",
      label: "Payment",
      options: PAYMENT_STATUS_OPTIONS,
      placeholder: "Payment status",
      className: "w-full sm:w-[140px]",
      ariaLabel: "Filter by payment status",
    },
  ];

  const initialValues = {
    search: initialSearch,
    type: initialType,
    status: initialStatus,
    paymentStatus: initialPaymentStatus,
  };

  return (
    <SearchFilter
      searchPlaceholder="Search orders by number, customer name, email, or phone..."
      filters={filters}
      initialValues={initialValues}
    />
  );
};
