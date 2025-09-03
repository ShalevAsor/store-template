// app/admin/layout.tsx
import { cookies } from "next/headers";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Separator } from "@/components/ui/separator";

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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </header>

        {/* Main content automatically fills remaining height */}
        <main className="flex-1 flex flex-col p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
