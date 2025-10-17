// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { OrderActionsDropdown } from "@/components/admin/orders/OrderActionsDropdown";
// import { OrderWithItems } from "@/types/order";
// import { formatPrice } from "@/utils/currencyUtils";
// import { formatDate } from "@/utils/dateUtils";
// import {
//   getOrderStatusBadge,
//   getPaymentStatusBadge,
// } from "@/utils/statusUtils";

// interface OrdersTableProps {
//   orders: OrderWithItems[];
//   onCancelOrder: (id: string, orderNumber: string) => void;
//   onUpdateStatus: (id: string, orderNumber: string, newStatus: string) => void;
//   onProcessRefund: (id: string, orderNumber: string, amount: number) => void;
// }

// export function OrdersTable({
//   orders,
//   onCancelOrder,
//   onUpdateStatus,
//   onProcessRefund,
// }: OrdersTableProps) {
//   const getItemsDisplay = (order: OrderWithItems) => {
//     const itemCount = order.orderItems.reduce(
//       (total, item) => total + item.quantity,
//       0
//     );
//     const uniqueProducts = order.orderItems.length;

//     if (uniqueProducts === 1) {
//       return `${itemCount} item${itemCount > 1 ? "s" : ""}`;
//     }

//     return `${itemCount} items (${uniqueProducts} products)`;
//   };

//   if (orders.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           No orders found
//         </h3>
//         <p className="text-gray-600 mb-4">
//           Orders will appear here once customers start purchasing.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Order</TableHead>
//           <TableHead>Customer</TableHead>
//           <TableHead>Items</TableHead>
//           <TableHead>Total</TableHead>
//           <TableHead>Order Status</TableHead>
//           <TableHead>Payment</TableHead>
//           <TableHead>Type</TableHead>
//           <TableHead>Date</TableHead>
//           <TableHead className="text-right">Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {orders.map((order) => {
//           return (
//             <TableRow key={order.id}>
//               <TableCell>
//                 <div className="min-w-0">
//                   <div className="font-medium text-gray-900">
//                     {order.orderNumber}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     ID: {order.id.slice(-8)}
//                   </div>
//                 </div>
//               </TableCell>

//               <TableCell>
//                 <div className="min-w-0">
//                   <div className="font-medium text-gray-900 truncate">
//                     {order.customerName}
//                   </div>
//                   <div className="text-sm text-gray-500 truncate">
//                     {order.customerEmail}
//                   </div>
//                   {order.customerPhone && (
//                     <div className="text-xs text-gray-500">
//                       {order.customerPhone}
//                     </div>
//                   )}
//                 </div>
//               </TableCell>

//               <TableCell>
//                 <div className="text-sm text-gray-900">
//                   {getItemsDisplay(order)}
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   {order.orderItems[0]?.productName}
//                   {order.orderItems.length > 1 && (
//                     <span> +{order.orderItems.length - 1} more</span>
//                   )}
//                 </div>
//               </TableCell>

//               <TableCell>
//                 <div className="font-medium">
//                   {formatPrice(order.totalAmount)}
//                 </div>
//               </TableCell>

//               <TableCell>{getOrderStatusBadge(order.status)}</TableCell>

//               <TableCell>
//                 {getPaymentStatusBadge(order.paymentStatus)}
//               </TableCell>

//               <TableCell>
//                 <Badge variant={order.isDigital ? "secondary" : "default"}>
//                   {order.isDigital ? "Digital" : "Physical"}
//                 </Badge>
//               </TableCell>

//               <TableCell className="text-gray-500 text-sm">
//                 {formatDate(order.createdAt)}
//               </TableCell>

//               <TableCell className="text-right">
//                 <OrderActionsDropdown
//                   order={order}
//                   isDetailPage={false} // Explicitly set for table view
//                   onCancel={() => onCancelOrder(order.id, order.orderNumber)}
//                   onUpdateStatus={(newStatus) =>
//                     onUpdateStatus(order.id, order.orderNumber, newStatus)
//                   }
//                   onRefund={() =>
//                     onProcessRefund(
//                       order.id,
//                       order.orderNumber,
//                       order.totalAmount
//                     )
//                   }
//                 />
//               </TableCell>
//             </TableRow>
//           );
//         })}
//       </TableBody>
//     </Table>
//   );
// }
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderActionsDropdown } from "@/components/admin/orders/OrderActionsDropdown";
import { OrderStatus, OrderWithItems, PaymentStatus } from "@/types/order";
import { formatPrice } from "@/utils/currencyUtils";
import { formatDate } from "@/utils/dateUtils";
import {
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from "@/utils/statusUtils";
import {
  getItemsDisplay,
  getShippingAddress,
  getTotalAmount,
} from "@/utils/orderUtils";

interface OrdersTableProps {
  orders: OrderWithItems[];
  onChangeOrderStatus: (
    id: string,
    orderNumber: string,
    currentStatus: OrderStatus
  ) => void;
  onChangePaymentStatus: (
    id: string,
    orderNumber: string,
    currentStatus: PaymentStatus
  ) => void;
  onProcessRefund: (
    id: string,
    orderNumber: string,
    amount: number,
    alreadyRefunded: number
  ) => void;
  onCancelOrder: (id: string, orderNumber: string) => void;
}

export function OrdersTable({
  orders,
  onChangeOrderStatus,
  onChangePaymentStatus,
  onProcessRefund,
  onCancelOrder,
}: OrdersTableProps) {
  const renderPaymentInfo = (order: OrderWithItems) => {
    const totalAmount = getTotalAmount(
      order.subtotal,
      order.shippingAmount,
      order.taxAmount
    );

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {order.paymentMethod}
          </Badge>
          {getPaymentStatusBadge(order.paymentStatus)}
        </div>

        <div className="text-sm">
          {order.paidAmount ? (
            <span
              className={`font-medium ${
                order.paidAmount !== totalAmount
                  ? "text-amber-600"
                  : "text-green-600"
              }`}
            >
              Paid: {formatPrice(order.paidAmount)}
            </span>
          ) : (
            <span className="text-gray-500">Not paid</span>
          )}
          {order.paidAt && (
            <span className="text-gray-500 ml-2">
              • {formatDate(order.paidAt)}
            </span>
          )}
        </div>

        {(order.paymentId || order.transactionId) && (
          <div className="text-xs text-gray-500 space-y-0.5">
            {order.paymentId && <div>Pay ID: {order.paymentId.slice(-8)}</div>}
            {order.transactionId && (
              <div>Txn ID: {order.transactionId.slice(-8)}</div>
            )}
          </div>
        )}

        {order.payerEmail && order.payerEmail !== order.customerEmail && (
          <div className="text-xs text-amber-600">
            Payer: {order.payerEmail}
          </div>
        )}
      </div>
    );
  };

  const renderAmountBreakdown = (order: OrderWithItems) => {
    const totalAmount = getTotalAmount(
      order.subtotal,
      order.shippingAmount,
      order.taxAmount
    );
    const hasBreakdown = order.shippingAmount || order.taxAmount;

    return (
      <div className="space-y-1">
        <div className="font-medium">Total: {formatPrice(totalAmount)}</div>

        {hasBreakdown && (
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>Subtotal: {formatPrice(order.subtotal)}</div>
            {order.shippingAmount && order.shippingAmount > 0 && (
              <div>Shipping: {formatPrice(order.shippingAmount)}</div>
            )}
            {order.taxAmount && order.taxAmount > 0 && (
              <div>Tax: {formatPrice(order.taxAmount)}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No orders found
        </h3>
        <p className="text-gray-600 mb-4">
          Orders will appear here once customers start purchasing.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Info</TableHead>
          <TableHead>Order Status</TableHead>
          <TableHead>Shipping Address</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const totalAmount = getTotalAmount(
            order.subtotal,
            order.shippingAmount,
            order.taxAmount
          );
          const shippingAddress = getShippingAddress(order);

          return (
            <TableRow key={order.id}>
              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {order.id.slice(-8)}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {order.customerEmail}
                  </div>
                  {order.customerPhone && (
                    <div className="text-xs text-gray-500">
                      {order.customerPhone}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-900">
                  {getItemsDisplay(order)}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {order.orderItems[0]?.productName}
                  {order.orderItems.length > 1 && (
                    <span> +{order.orderItems.length - 1} more</span>
                  )}
                </div>
              </TableCell>

              <TableCell>{renderAmountBreakdown(order)}</TableCell>

              <TableCell>{renderPaymentInfo(order)}</TableCell>

              <TableCell>{getOrderStatusBadge(order.status)}</TableCell>

              <TableCell>
                <div className="text-sm text-gray-600 max-w-[230px]">
                  {shippingAddress}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={order.isDigital ? "secondary" : "default"}>
                  {order.isDigital ? "Digital" : "Physical"}
                </Badge>
              </TableCell>

              <TableCell className="text-gray-500 text-sm">
                {formatDate(order.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <OrderActionsDropdown
                  order={order}
                  isDetailPage={false}
                  onChangeOrderStatus={() =>
                    onChangeOrderStatus(
                      order.id,
                      order.orderNumber,
                      order.status
                    )
                  }
                  onChangePaymentStatus={() =>
                    onChangePaymentStatus(
                      order.id,
                      order.orderNumber,
                      order.paymentStatus
                    )
                  }
                  onProcessRefund={() =>
                    onProcessRefund(
                      order.id,
                      order.orderNumber,
                      totalAmount,
                      order.refundAmount || 0
                    )
                  }
                  onCancelOrder={() =>
                    onCancelOrder(order.id, order.orderNumber)
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
