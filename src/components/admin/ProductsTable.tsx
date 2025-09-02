// components/admin/ProductsTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SerializedProduct } from "@/lib/products";
import { ProductActionsDropdown } from "@/components/admin/ProductActionsDropdown";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import Link from "next/link";
import { toast } from "sonner";
import { deleteProduct } from "@/lib/actions/productActions";

interface ProductsTableProps {
  products: SerializedProduct[];
}

type DialogState = {
  open: boolean;
  productId: string;
  productName: string;
};

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
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
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 mb-4">
          Get started by creating your first product.
        </p>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell>
                <Badge variant={product.isDigital ? "secondary" : "default"}>
                  {product.isDigital ? "Digital" : "Physical"}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-500">
                {formatDate(product.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <ProductActionsDropdown
                  productId={product.id}
                  onDelete={() => handleDeleteClick(product.id, product.name)}
                  isDeleting={deletingId === product.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
