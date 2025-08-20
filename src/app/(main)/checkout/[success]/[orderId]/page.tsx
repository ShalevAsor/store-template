import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getOrder } from "@/lib/orders";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CheckoutSuccessActions } from "@/components/checkout/CheckoutSuccessActions";
import { CheckoutSuccessHeader } from "@/components/checkout/CheckoutSuccessHeader";
import { OrderDetails } from "@/components/checkout/OrderDetails";
import { OrderSummarySidebar } from "@/components/checkout/OrderSummarySidebar";
import { NextSteps } from "@/components/checkout/NextSteps";

interface CheckoutSuccessPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CheckoutSuccessPageProps): Promise<Metadata> {
  const { orderId } = await params;

  return {
    title: `Order Confirmation | Your Store`,
    description: `Order ${orderId.slice(-8).toUpperCase()} has been confirmed.`,
  };
}

export default async function CheckoutSuccessPage({
  params,
}: CheckoutSuccessPageProps) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
    { label: "Order Confirmation" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Success Header */}
      <CheckoutSuccessHeader />

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Order Details */}
        <OrderDetails order={order} />

        {/* Order Summary Sidebar */}
        <OrderSummarySidebar
          totalAmount={order.totalAmount}
          isDigital={order.isDigital}
        />
      </div>

      {/* Next Steps */}
      <NextSteps isDigital={order.isDigital} />

      {/* Action Buttons */}
      <CheckoutSuccessActions />
    </div>
  );
}
