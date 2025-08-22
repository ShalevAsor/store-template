// app/admin/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {"Welcome back! Here's what's happening with your store."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Simple Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage your store products</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/products">
                <Package className="h-4 w-4 mr-2" />
                View Products
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View and manage orders</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/orders">
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
