import { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

export async function generateMetadata(): Promise<Metadata> {
  const products = await getProducts();
  const productCount = products.length;

  return {
    title: `Products | Your Store`,
    description:
      productCount > 0
        ? `Browse our collection of ${productCount} products. Find digital downloads, physical goods, and more.`
        : "Explore our product collection. New items added regularly.",
    openGraph: {
      title: "Products | Your Store",
      description:
        productCount > 0
          ? `Browse our collection of ${productCount} products`
          : "Explore our product collection",
      type: "website",
    },
  };
}

export default async function ProductsPage() {
  const products = await getProducts();

  const isEmpty = products.length === 0;
  if (isEmpty) {
    return <EmptyState variant="products" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Our Products" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
