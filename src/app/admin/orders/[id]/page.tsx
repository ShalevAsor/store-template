import { CustomerInfoCard } from "@/components/admin/orders/CustomerInfoCard";
import { OrderItemsCard } from "@/components/admin/orders/OrderItemsCard";
import { OrderOverviewCard } from "@/components/admin/orders/OrderOverviewCard";
import { PaymentInfoCard } from "@/components/admin/orders/PaymentInfoCard";
import { getOrder } from "@/lib/orders";
import { notFound } from "next/navigation";

interface OrderDetailsPageParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageParams) {
  const { id } = await params;

  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Order overview */}
      <div className="w-full">
        <OrderOverviewCard order={order} />
      </div>

      {/* Two column layout for customer and payment info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomerInfoCard order={order} />
        <PaymentInfoCard order={order} />
      </div>

      {/* Order Items */}
      <div className="w-full">
        <OrderItemsCard order={order} />
      </div>
    </div>
  );
}
