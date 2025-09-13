import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderDetails } from "@/components/admin/orders/OrderDetails";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/orders";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    <div className="space-y-2">
      {/* Header with navigation  */}
      <div className="flex justify-between">
        <AdminHeader
          title={`Order details`}
          subtitle={`View full ${order.orderNumber} details`}
        />
        {/* Back to orders navigation */}
        <Button asChild variant="ghost">
          <Link href={"/admin/orders"}>
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
      {/* Order details  */}
      <OrderDetails order={order} />
    </div>
  );
}
