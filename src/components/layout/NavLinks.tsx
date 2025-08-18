"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavLinks = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <div className={className}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-gray-600 hover:text-gray-900 font-medium transition-colors",
            pathname === link.href && "text-gray-900 font-semibold"
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};
