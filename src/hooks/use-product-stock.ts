import { useQuery } from "@tanstack/react-query";
import { getProductsStock } from "@/lib/products";

export const useProductStock = (productIds: string[]) => {
  return useQuery({
    queryKey: ["productStock", productIds.sort()], // Sort for consistent caching
    queryFn: () => getProductsStock(productIds),
    enabled: productIds.length > 0,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
