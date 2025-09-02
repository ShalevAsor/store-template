"use client";

import { useCartStore } from "@/store/cartStore";
import { useProductStock } from "@/hooks/use-product-stock";
import { AlertTriangle } from "lucide-react";

export const StockWarning: React.FC = () => {
  const { items } = useCartStore();
  const productIds = items.map((item) => item.id);
  const { data: stockData } = useProductStock(productIds);

  if (!stockData) return null;

  const warnings = items.filter((item) => {
    if (item.isDigital) return false;
    const stock = stockData[item.id];
    return stock !== null && stock < item.quantity;
  });

  if (warnings.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <p className="text-amber-800 text-sm">
          Some items have limited stock. Final availability will be confirmed
          when you place your order.
        </p>
      </div>
    </div>
  );
};
