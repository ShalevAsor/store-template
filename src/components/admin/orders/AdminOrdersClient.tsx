"use client";

import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { SerializedOrder } from "@/types/order";
import { useOrderActions } from "@/hooks/use-order-actions";

interface AdminOrdersClientProps {
  orders: SerializedOrder[];
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const { handleCancelOrder, handleUpdateStatus, handleProcessRefund } =
    useOrderActions();

  return (
    <OrdersTable
      orders={orders}
      onCancelOrder={handleCancelOrder}
      onUpdateStatus={handleUpdateStatus}
      onProcessRefund={handleProcessRefund}
    />
  );
}
