import { Metadata } from "next";
import { CreateProductClient } from "@/components/admin/CreateProductClient";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Product | Admin",
  description: "Create a new product for your store",
};

export default function CreateProductPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Create New Product"
        description="Add a new product to your store catalog"
      />

      {/* Back Button and Header */}
      <div className="flex items-center gap-4">
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
