"use client";

import Link from "next/link";

import { CartBadge } from "@/components/layout/CartBadge";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileMenu } from "@/components/layout/MobileMenu";

// Main Navbar Component
export const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold text-xl text-gray-900 hover:text-gray-700 transition-colors"
        >
          Store
        </Link>

        {/* Desktop Navigation */}
        <NavLinks className="hidden md:flex items-center space-x-8" />

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          <CartBadge />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};
