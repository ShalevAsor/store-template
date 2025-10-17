"use client";

import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { useOrderActions } from "@/hooks/use-order-actions";
import { OrderWithItems } from "@/types/order";

interface AdminOrdersClientProps {
  orders: OrderWithItems[];
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const {
    handleChangeOrderStatus,
    handleChangePaymentStatus,
    handleProcessRefund,
    handleCancelOrder,
  } = useOrderActions();

  return (
    <OrdersTable
      orders={orders}
      onChangeOrderStatus={handleChangeOrderStatus}
      onChangePaymentStatus={handleChangePaymentStatus}
      onProcessRefund={handleProcessRefund}
      onCancelOrder={handleCancelOrder}
    />
  );
}
