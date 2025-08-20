"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CreditCard, Smartphone } from "lucide-react";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import {
  createCheckoutFormSchema,
  type CheckoutFormData,
} from "@/schemas/checkoutSchema";
import type { CheckoutResult } from "@/lib/actions/checkoutAction";
import type { CartItem } from "@/types/cart";
import { isDigitalOrder } from "@/utils/orderUtils";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<CheckoutResult>;
  cartItems: CartItem[];
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cartItems,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const orderIsDigital = isDigitalOrder(cartItems);

  // Create schema based on order type
  const checkoutSchema = createCheckoutFormSchema(orderIsDigital);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      paymentMethod: "card",
    },
  });

  // Watch payment method to show dynamic content
  const selectedPaymentMethod = watch("paymentMethod");

  const onFormSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const result = await onSubmit(data);

      if (!result.success) {
        // Handle field-specific errors from server
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof CheckoutFormData, {
              type: "server",
              message: messages[0], // Take the first error message
            });
          });
        }

        // Handle general server errors
        if (result.error) {
          setServerError(result.error);
        }
      }
      // Success case is handled by redirect in server action
    } catch (error) {
      console.error("Form submission error:", error);
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryServerError = () => {
    setServerError("");
  };

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card", icon: CreditCard },
    { value: "paypal", label: "PayPal", icon: Smartphone },
    { value: "stripe", label: "Stripe", icon: CreditCard },
    { value: "bank_transfer", label: "Bank Transfer", icon: CreditCard },
    { value: "wallet", label: "Digital Wallet", icon: Smartphone },
  ];

  const getPaymentMethodInfo = (method: string) => {
    const messages = {
      card: "Credit/Debit card payment will be processed securely.",
      paypal: "You'll be redirected to PayPal to complete payment.",
      stripe: "Secure payment processing via Stripe.",
      bank_transfer:
        "Bank transfer details will be provided after order confirmation.",
      wallet: "Digital wallet payment (Apple Pay, Google Pay, etc.).",
    };
    return messages[method as keyof typeof messages] || "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {orderIsDigital
            ? "Customer & Payment Information"
            : "Shipping & Payment Information"}
        </CardTitle>
        <CardDescription>
          {orderIsDigital
            ? "Complete your details to receive your digital products"
            : "Please fill in your details to complete your order"}
        </CardDescription>
        {orderIsDigital && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              📱 This order contains only digital products - no shipping
              required!
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Server Error Display */}
        {serverError && (
          <div className="mb-6">
            <ErrorMessage
              message={serverError}
              variant="error"
              onRetry={handleRetryServerError}
              onDismiss={handleRetryServerError}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="John Doe"
                  className={errors.customerName ? "border-red-500" : ""}
                  disabled={isLoading}
                  {...register("customerName")}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                  {...register("customerPhone")}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="john@example.com"
                className={errors.customerEmail ? "border-red-500" : ""}
                disabled={isLoading}
                {...register("customerEmail")}
              />
              {errors.customerEmail && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.customerEmail.message}
                </p>
              )}
              {orderIsDigital && (
                <p className="text-xs text-gray-500 mt-1">
                  Digital products will be delivered to this email address
                </p>
              )}
            </div>
          </div>

          {/* Shipping Information - Only show if not digital */}
          {!orderIsDigital && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Shipping Address
              </h3>

              <div>
                <Label htmlFor="shippingAddress">Complete Address *</Label>
                <Textarea
                  id="shippingAddress"
                  placeholder="123 Main Street, Apt 4B&#10;New York, NY 10001&#10;United States"
                  rows={4}
                  className={errors.shippingAddress ? "border-red-500" : ""}
                  disabled={isLoading}
                  {...register("shippingAddress")}
                />
                {errors.shippingAddress && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.shippingAddress.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Method
            </h3>

            <div>
              <Label>Select Payment Method *</Label>
              <Select
                value={selectedPaymentMethod}
                onValueChange={(value) => {
                  setValue(
                    "paymentMethod",
                    value as CheckoutFormData["paymentMethod"],
                    {
                      shouldValidate: true,
                    }
                  );
                  clearErrors("paymentMethod");
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={errors.paymentMethod ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}

              {/* Payment method info */}
              {selectedPaymentMethod && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    {getPaymentMethodInfo(selectedPaymentMethod)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Order...
              </>
            ) : orderIsDigital ? (
              "Complete Purchase"
            ) : (
              "Complete Order"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
