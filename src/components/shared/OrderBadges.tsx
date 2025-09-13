import { Badge } from "@/components/ui/badge";

export const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    case "CONFIRMED":
      return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
    case "PROCESSING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      );
    case "SHIPPED":
      return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
    case "DELIVERED":
      return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    case "REFUNDED":
      return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">Pending</Badge>;
    case "PROCESSING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      );
    case "PAID":
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    case "REFUNDED":
      return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
