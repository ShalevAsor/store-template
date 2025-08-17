import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  // convert decimal to number for client component
  const serializedProducts = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));

  return (
    <>
      <h1 className="text-lg font-bold">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serializedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
