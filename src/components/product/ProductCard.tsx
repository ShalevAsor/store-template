"use client";

import { ProductWithImages } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../shared/Badge";
import { ImagePlaceholder } from "../shared/ImagePlaceholder";
import { AddToCartButton } from "../cart/AddToCartButton";
import { getImageUrl } from "@/lib/images";
import { getStockDisplay } from "@/utils/statusUtils";
import { formatPrice } from "@/utils/currencyUtils";

interface ProductCardProps {
  product: ProductWithImages;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const mainImage = product.images[0]?.imageKey;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block">
        {mainImage ? (
          <div className="relative w-full h-48">
            <Image
              src={getImageUrl(mainImage)}
              alt={product.images[0]?.altText || product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <ImagePlaceholder size="lg" />
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Product Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Category Badge */}
        {product.category && (
          <div className="mb-3">
            <Badge type="category">{product.category}</Badge>
          </div>
        )}

        {/* Pricing and Actions */}
        <div className="flex items-center justify-between">
          {/* Price Display */}

          <div className="flex flex-col">
            {/* Price Display */}
            <span className="font-medium text-green-500">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <div className="text-xs text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </div>
              )}
          </div>

          {/* Add to Cart Button */}
          <AddToCartButton product={product} variant="simple" />
        </div>

        {/* Stock Status for Physical Products Only */}
        {!product.isDigital && (
          <div className="mt-2">
            {getStockDisplay(product.stock, product.isDigital)}
          </div>
        )}

        {/* Digital Badge - Only show if not already shown in category */}
        {product.isDigital && product.category !== "Digital Products" && (
          <div className="mt-2">
            <Badge type="digital">Digital Product</Badge>
          </div>
        )}
      </div>
    </div>
  );
};
