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
import { ProductActionsDropdown } from "@/components/admin/products/ProductActionsDropdown";
import Link from "next/link";
import { SerializedProduct } from "@/types/product";
import { formatPrice } from "@/utils/priceUtils";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import Image from "next/image";
import { getImageUrl } from "@/lib/images";

interface ProductsTableProps {
  products: SerializedProduct[];
  onDeleteProduct: (id: string, name: string) => void;
}

export function ProductsTable({
  products,
  onDeleteProduct,
}: ProductsTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStockDisplay = (stock: number | null, isDigital: boolean) => {
    if (isDigital) {
      return <span className="text-blue-600 text-sm">Digital</span>;
    }

    if (stock === null) {
      return <span className="text-green-600 text-sm">Unlimited</span>;
    }

    if (stock === 0) {
      return <span className="text-red-600 text-sm">Out of stock</span>;
    }

    return <span className="text-gray-900 text-sm">{stock} in stock</span>;
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          // Get first image or use placeholder
          const firstImage = product.images?.[0];

          return (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    {firstImage ? (
                      <Image
                        src={getImageUrl(firstImage.imageKey)}
                        alt={firstImage.altText || product.name}
                        className="w-full h-full object-cover"
                        width={60}
                        height={60}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImagePlaceholder size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    {product.sku && (
                      <div className="text-xs text-gray-500">
                        SKU: {product.sku}
                      </div>
                    )}
                    {product.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="font-medium">{formatPrice(product.price)}</div>
                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </div>
                  )}
              </TableCell>

              <TableCell>
                {getStockDisplay(product.stock, product.isDigital)}
              </TableCell>

              <TableCell>
                {product.category ? (
                  <span className="text-sm text-gray-900">
                    {product.category}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">No category</span>
                )}
              </TableCell>

              <TableCell>{getStatusBadge(product.status)}</TableCell>

              <TableCell>
                <Badge variant={product.isDigital ? "secondary" : "default"}>
                  {product.isDigital ? "Digital" : "Physical"}
                </Badge>
              </TableCell>

              <TableCell className="text-gray-500 text-sm">
                {formatDate(product.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <ProductActionsDropdown
                  productId={product.id}
                  productSlug={product.slug}
                  onDelete={() => onDeleteProduct(product.id, product.name)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
