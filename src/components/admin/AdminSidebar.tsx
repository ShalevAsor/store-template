// components/admin/AdminSidebar.tsx
import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  Users,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const items = [
    { name: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { name: "Products", url: "/admin/products", icon: Package },
    { name: "Orders", url: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", url: "/admin/customers", icon: Users },
    { name: "Settings", url: "/admin/settings", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex items-center gap-2">
                  <Store className="h-8 w-8 text-blue-600" />
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Store Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Manage your store
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AdminLogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
