"use client";

import { toast } from "sonner";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { deleteProduct } from "@/lib/actions/productActions";
import { SerializedProduct } from "@/types/product";
import { useModalStore } from "@/store/modalStore";

interface AdminProductsClientProps {
  products: SerializedProduct[];
}

export function AdminProductsClient({ products }: AdminProductsClientProps) {
  const { onOpen } = useModalStore();

  const handleDeleteClick = (id: string, name: string) => {
    onOpen("confirmAction", {
      confirmAction: {
        title: "Delete Product",
        description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: async () => {
          const result = await deleteProduct(id);
          if (result.success) {
            toast.success(`Product "${name}" deleted successfully`);
          } else {
            toast.error(result.error || "Failed to delete product");
            throw new Error(result.error); // Signal modal to stay open
          }
        },
      },
    });
  };

  return (
    <ProductsTable products={products} onDeleteProduct={handleDeleteClick} />
  );
}
