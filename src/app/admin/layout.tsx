// app/admin/layout.tsx
import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* Header */}
        <AdminHeader />

        {/* Main content automatically fills remaining height */}
        <main className="flex-1 flex flex-col p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
