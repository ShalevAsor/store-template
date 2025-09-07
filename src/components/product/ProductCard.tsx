"use client";

import { SerializedProduct } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../shared/Badge";
import { ImagePlaceholder } from "../shared/ImagePlaceholder";
import { AddToCartButton } from "./AddToCartButton";
// Import centralized price utilities
import { formatPriceWithDiscount, getStockDisplay } from "@/utils/priceUtils";
import { getImageUrl } from "@/lib/images";

interface ProductCardProps {
  product: SerializedProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const mainImage = product.images[0]?.imageKey;

  // Use centralized price formatting
  const priceDisplay = formatPriceWithDiscount(
    product.price,
    product.compareAtPrice
  );

  // Use centralized stock display
  const stockDisplay = getStockDisplay(product.stock, product.isDigital);

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
            {priceDisplay.hasDiscount ? (
              <>
                <span className="text-xl font-bold text-green-600">
                  {priceDisplay.currentPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {priceDisplay.originalPrice}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-green-600">
                {priceDisplay.currentPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <AddToCartButton product={product} variant="simple" />
        </div>

        {/* Stock Status for Physical Products Only */}
        {!product.isDigital && (
          <div className="mt-2">
            <span className={`text-sm ${stockDisplay.className}`}>
              {stockDisplay.text}
            </span>
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
