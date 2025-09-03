"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  createProduct,
  ProductActionResult,
} from "@/lib/actions/productActions";
import { ProductFormData } from "@/schemas/productSchema";
import { UseFormReset, UseFormSetError } from "react-hook-form";

export function CreateProductClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    data: ProductFormData,
    setError: UseFormSetError<ProductFormData>,
    reset: UseFormReset<ProductFormData>
  ) => {
    setIsSubmitting(true);

    try {
      const result: ProductActionResult = await createProduct(data);

      if (result.success && result.data) {
        toast.success("Product created successfully!");
        reset();
      } else {
        // Set server-side field errors
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
        // Show general error if provided
        if (result.error) {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Unexpected error creating product:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Create Product"
    />
  );
}
