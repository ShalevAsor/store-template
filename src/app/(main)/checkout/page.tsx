import { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout | Your Store",
  description: "Complete your purchase securely and safely.",
};

export default function CheckoutPage() {
  const breadcrumbItems = [
    { label: "Cart", href: "/cart" },
    { label: "Checkout" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <PageHeader
        title="Checkout"
        description="Review your order and complete your purchase"
        className="mb-8"
      />

      <CheckoutClient />

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Secure Checkout
            </h3>
            <p className="text-sm text-gray-600">
              Your payment information is encrypted and secure. We never store
              your payment details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
