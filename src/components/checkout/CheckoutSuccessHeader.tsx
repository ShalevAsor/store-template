import { CheckCircle } from "lucide-react";

export const CheckoutSuccessHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Order Confirmed!
      </h1>
      <p className="text-gray-600">
        Thank you for your order. We've received your payment and will process
        your order shortly.
      </p>
    </div>
  );
};
