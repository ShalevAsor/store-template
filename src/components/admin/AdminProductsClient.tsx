"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { deleteProduct } from "@/lib/actions/productActions";
import { SerializedProduct } from "@/types/product";

interface AdminProductsClientProps {
  products: SerializedProduct[];
}

type DialogState = {
  open: boolean;
  productId: string;
  productName: string;
};

export function AdminProductsClient({ products }: AdminProductsClientProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<DialogState>({
    open: false,
    productId: "",
    productName: "",
  });

  const handleDeleteClick = (id: string, name: string) => {
    setConfirmDialog({
      open: true,
      productId: id,
      productName: name,
    });
  };

  const handleConfirmDelete = async () => {
    const { productId } = confirmDialog;
    setDeletingId(productId);

    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast.success("Product deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    } finally {
      setDeletingId(null);
      setConfirmDialog({ open: false, productId: "", productName: "" });
    }
  };

  return (
    <>
      <ProductsTable
        products={products}
        onDeleteProduct={handleDeleteClick}
        deletingId={deletingId}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title="Delete Product"
        description={`Are you sure you want to delete "${confirmDialog.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
