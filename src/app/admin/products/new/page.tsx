import { Metadata } from "next";
import { CreateProductClient } from "@/components/admin/products/CreateProductClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Create Product | Admin",
  description: "Create a new product for your store",
};

export default function CreateProductPage() {
  return (
    <div className="space-y-2">
      {/* Header with navigation */}
      <div className="flex justify-between">
        <AdminHeader
          title="Create New Product"
          subtitle="Add a new product to your store catalog"
        />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      {/* Form Component */}
      <div className="container mx-auto ">
        <CreateProductClient />
      </div>
    </div>
  );
}
