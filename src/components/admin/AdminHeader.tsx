"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { ArrowLeft } from "lucide-react";

type Action = {
  label: string;
  href: string;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link";
  icon?: React.ReactNode;
};

type RouteConfig = {
  when: (pathname: string) => boolean;
  title: string;
  actions?: Action[];
};

const routeConfig: RouteConfig[] = [
  {
    when: (p) => p === "/admin/products",
    title: "Products",
    actions: [
      {
        label: "Add Product",
        href: "/admin/products/new",
        icon: <span className="mr-2">＋</span>,
      },
    ],
  },
  {
    when: (p) => p.startsWith("/admin/products/new"),
    title: "Add Product",
    actions: [
      {
        label: "Back to Products",
        href: "/admin/products",
        variant: "secondary",
        icon: <ArrowLeft />,
      },
    ],
  },
  {
    when: (p) => p.startsWith("/admin/products/") && p.endsWith("/edit"),
    title: "Edit Product",
    actions: [
      {
        label: "Back to Products",
        href: "/admin/products",
        variant: "secondary",
        icon: <ArrowLeft />,
      },
    ],
  },
  {
    when: (p) => p.startsWith("/admin/orders"),
    title: "Orders",
    actions: [
      {
        label: "Export CSV",
        href: "/admin/orders/export",
        variant: "outline",
        icon: <span className="mr-2">⬇️</span>,
      },
    ],
  },
  {
    when: (p) => p.startsWith("/admin/orders") && p.endsWith("/edit"),
    title: "Edit Product",
    actions: [
      {
        label: "Back to Orders",
        href: "/admin/orders",
        variant: "secondary",
        icon: <ArrowLeft />,
      },
    ],
  },
  {
    when: (p) => p.startsWith("/admin/settings"),
    title: "Settings",
    actions: [
      {
        label: "Back to Dashboard",
        href: "/admin",
        variant: "secondary",
        icon: <ArrowLeft />,
      },
    ],
  },
  {
    when: () => true,
    title: "Dashboard",
    actions: [
      {
        label: "Back to Store",
        href: "/",
        variant: "secondary",
        icon: <ArrowLeft />,
      },
    ],
  },
];

function getHeaderFor(pathname: string) {
  return (
    routeConfig.find((r) => r.when(pathname)) ?? {
      title: "Dashboard",
      actions: [],
    }
  );
}

export function AdminHeader() {
  const pathname = usePathname();
  const { title, actions = [] } = getHeaderFor(pathname || "");

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map(({ label, href, variant = "default", icon }, i) => (
              <Button key={i} variant={variant} asChild>
                <Link href={href}>
                  {icon}
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
