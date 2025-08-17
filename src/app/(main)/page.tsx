import { prisma } from "@/lib/prisma";

export default async function Home() {
  const productCount = await prisma.product.count();

  return (
    <div>
      <h1 className="text-lg">My Store</h1>
      <p>Products in database: {productCount}</p>
    </div>
  );
}
