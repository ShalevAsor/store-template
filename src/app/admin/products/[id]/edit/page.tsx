import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductForAdmin } from "@/lib/products";
import { EditProductClient } from "@/components/admin/products/EditProductClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { productToFormData } from "@/schemas/productSchema";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForAdmin(id);

  if (!product) {
    return {
      title: "Product Not Found | Admin",
    };
  }

  return {
    title: `Edit ${product.name} | Admin`,
    description: `Edit product: ${product.name}`,
  };
}

/**
 * Edit product page - Server Component that fetches product data and renders the form
 * Located at /admin/products/[id]/edit
 */
export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductForAdmin(id);

  if (!product) {
    notFound();
  }

  // Convert product data to form data
  const initialData = productToFormData(product);

  return (
    <div className="space-y-2">
      {/* Header with navigation */}
      <div className="flex justify-between">
        <AdminHeader
          title={`Edit Product: ${product.name}`}
          subtitle="Update product information and settings"
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
        <EditProductClient productId={id} initialData={initialData} />
      </div>
    </div>
  );
}
