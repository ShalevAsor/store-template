import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductForAdmin } from "@/lib/products";
import { EditProductClient } from "@/components/admin/products/EditProductClient";

import { productToFormData } from "@/schemas/productSchema";

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
      <EditProductClient productId={id} initialData={initialData} />
    </div>
  );
}
