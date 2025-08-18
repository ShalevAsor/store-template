import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Your Store`,
    description:
      product.description ||
      `Buy ${product.name} for $${product.price.toFixed(2)}`,
    openGraph: {
      title: product.name,
      description:
        product.description ||
        `Buy ${product.name} for $${product.price.toFixed(2)}`,
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, relatedProducts] = await Promise.all([
    getProduct(id),
    getRelatedProducts(id, 3),
  ]);

  if (!product) {
    notFound();
  }

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
        {/* Product Image */}
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg"></div>
                <p>No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Product Details - Template ready */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Product Details
            </h3>
            <dl className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <dt className="text-gray-600">SKU:</dt>
                <dd className="font-medium">{product.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Availability:</dt>
                <dd className="text-green-600 font-medium">In Stock</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Category:</dt>
                <dd className="font-medium">General</dd>
              </div>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
