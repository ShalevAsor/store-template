import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Badge } from "@/components/shared/Badge";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { formatPriceWithDiscount, getStockDisplay } from "@/utils/priceUtils";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const firstImage = product.images[0]?.imageUrl;
  // Use centralized price formatting for metadata
  const priceDisplay = formatPriceWithDiscount(
    product.price,
    product.compareAtPrice
  );

  return {
    title: `${product.name} | Your Store`,
    description:
      product.description ||
      `Buy ${product.name} for ${priceDisplay.currentPrice}`,
    openGraph: {
      title: product.name,
      description:
        product.description ||
        `Buy ${product.name} for ${priceDisplay.currentPrice}`,
      images: firstImage ? [{ url: firstImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product, relatedProducts] = await Promise.all([
    getProductBySlug(slug),
    getRelatedProducts(slug, 3),
  ]);

  if (!product) {
    notFound();
  }

  // Use centralized price formatting
  const priceDisplay = formatPriceWithDiscount(
    product.price,
    product.compareAtPrice
  );
  const stockDisplay = getStockDisplay(product.stock, product.isDigital);

  const breadcrumbItems = [
    { label: "Products", href: "/products" },
    { label: product.name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image Gallery */}
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        {/* Product Info */}
        <div className="space-y-6">
          {/* Product Name and Badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.category && (
                <Badge type="category">{product.category}</Badge>
              )}
              {/* Only show digital badge if category doesn't already indicate it */}
              {product.isDigital && product.category !== "Digital Products" && (
                <Badge type="digital">Digital Product</Badge>
              )}
              {priceDisplay.hasDiscount && <Badge type="sale">Sale</Badge>}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price Display */}
            <div className="mb-2">
              {priceDisplay.hasDiscount ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-green-600">
                    {priceDisplay.currentPrice}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {priceDisplay.originalPrice}
                  </span>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Save {priceDisplay.savings}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-green-600">
                  {priceDisplay.currentPrice}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Product Details
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              {product.sku && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">SKU:</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
              )}

              {product.category && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-medium">{product.category}</dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-gray-600">Type:</dt>
                <dd className="font-medium">
                  {product.isDigital ? "Digital Product" : "Physical Product"}
                </dd>
              </div>

              {/* Availability - Only for physical products, using centralized logic */}
              {!product.isDigital && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Availability:</dt>
                  <dd className={`font-medium ${stockDisplay.className}`}>
                    {stockDisplay.text}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Add to Cart */}
          <div className="border-t border-gray-200 pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
}
