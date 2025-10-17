import { ProductWithImages } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  products: ProductWithImages[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
};
