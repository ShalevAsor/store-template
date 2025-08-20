import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();

  const isEmpty = products.length === 0;
  if (isEmpty) {
    return <EmptyState variant="products" />;
  }

  return (
    <>
      <h1 className="text-lg font-bold">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
