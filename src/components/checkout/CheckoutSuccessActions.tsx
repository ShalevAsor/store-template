"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export const CheckoutSuccessActions: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
        <Link href="/products">Continue Shopping</Link>
      </Button>
      <Button
        variant="outline"
        onClick={() => window.print()}
        className="print:hidden"
      >
        Print Receipt
      </Button>
    </div>
  );
};
