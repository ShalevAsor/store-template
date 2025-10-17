import { Metadata } from "next";
import { CreateProductClient } from "@/components/admin/products/CreateProductClient";

export const metadata: Metadata = {
  title: "Create Product | Admin",
  description: "Create a new product for your store",
};

export default function CreateProductPage() {
  return (
    <div className="space-y-2">
      {/* Form Component */}
      <CreateProductClient />
    </div>
  );
}
