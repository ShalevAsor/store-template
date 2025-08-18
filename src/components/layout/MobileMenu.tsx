"use client";

import { Button } from "@/components/ui/button";
import { Menu, Home, Package } from "lucide-react";
import { CartBadge } from "@/components/layout/CartBadge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const MobileMenu = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
  ];

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navigate through the store sections
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col space-y-4 mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.url
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.title}
                </Link>
              );
            })}

            {/* Cart link - styled to match other menu items */}
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/cart"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <CartBadge />
              <span className="ml-[-2.5rem] pl-8">Cart</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
