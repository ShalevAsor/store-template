import { CheckCircle, Download, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface NextStepsProps {
  isDigital: boolean;
}

export const NextSteps: React.FC<NextStepsProps> = ({ isDigital }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{"What's Next?"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isDigital ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Download Your Products</h3>
                <p className="text-sm text-gray-600">
                  Download links have been sent to your email address. You can
                  also access them from your account.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Processing Your Order</h3>
                <p className="text-sm text-gray-600">
                  {
                    "We're preparing your order for shipment. You'll receive a tracking number via email once your order ships."
                  }
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Estimated Delivery</h3>
                <p className="text-sm text-gray-600">
                  Your order will be delivered within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
