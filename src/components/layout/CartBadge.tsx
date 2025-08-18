"use client";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const CartBadge = () => {
  const itemCount = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-semibold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
};
