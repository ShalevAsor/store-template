"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/products/ProductForm";
import {
  updateProduct,
  ProductActionResult,
} from "@/lib/actions/productActions";
import { ProductFormData } from "@/schemas/productSchema";
import { UseFormSetError } from "react-hook-form";

interface EditProductClientProps {
  productId: string;
  initialData: ProductFormData;
}

export function EditProductClient({
  productId,
  initialData,
}: EditProductClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    data: ProductFormData,
    setError: UseFormSetError<ProductFormData>
  ) => {
    setIsSubmitting(true);

    try {
      const result: ProductActionResult = await updateProduct(productId, data);

      if (result.success && result.data) {
        toast.success("Product updated successfully!");
        router.push("/admin/products");
      } else {
        // Show field-level errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            if (field in data) {
              setError(field as keyof ProductFormData, {
                type: "server",
                message: messages.join(", "),
              });
            }
          });
        }
        // General error
        if (result.error) {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Unexpected error updating product:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Update Product"
    />
  );
}
