import { OrderWithItems } from "@/types/order";
import { OrderOverviewCard } from "./OrderOverviewCard";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { PaymentInfoCard } from "./PaymentInfoCard";
import { OrderItemsCard } from "./OrderItemsCard";

interface OrderDetailsProps {
  order: OrderWithItems;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="space-y-4">
      {/* Order overview */}
      <OrderOverviewCard order={order} />

      {/* Two column layout for customer and payment info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerInfoCard order={order} />
        <PaymentInfoCard order={order} />
      </div>
      {/* Order Items */}
      <OrderItemsCard order={order} />
    </div>
  );
};
