import { PayPalPaymentSection } from "../checkout/PayPalPaymentSection";

// components/checkout/PaymentSection.tsx
interface PaymentSectionProps {
  orderId: string;
  paymentMethod: string; // "paypal", "card", etc.
  onPaymentStart: () => void;
  onPaymentComplete: (orderId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentSection({
  orderId,
  paymentMethod,
  onPaymentStart,
  onPaymentComplete,
  onPaymentError,
}: PaymentSectionProps) {
  switch (paymentMethod) {
    case "paypal":
      return (
        <PayPalPaymentSection
          orderId={orderId}
          isVisible={true}
          onPaymentStart={onPaymentStart}
          onPaymentComplete={onPaymentComplete}
          onPaymentError={onPaymentError}
        />
      );

    case "card":
    case "apple_pay":
    case "google_pay":
      return null;

    default:
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-700">
            {`Payment method "${paymentMethod}" is not supported yet.`}
          </p>
        </div>
      );
  }
}
