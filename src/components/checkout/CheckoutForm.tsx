"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type CheckoutFormData,
  checkoutFormSchema,
} from "@/schemas/checkoutSchema";
import type { CartItem } from "@/types/cart";
import { isDigitalOrder } from "@/utils/orderUtils";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>; // Changed: no return value needed
  cartItems: CartItem[];
  isLoading?: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cartItems,
  onSubmit,
  isLoading = false,
}) => {
  const [serverError, setServerError] = useState<string>("");

  const orderIsDigital = isDigitalOrder(cartItems);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      paymentMethod: "paypal",
      shippingAddress: orderIsDigital
        ? undefined
        : {
            line1: "",
            line2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "US",
          },
    },
  });

  // Watch payment method and country for dynamic content
  const selectedPaymentMethod = watch("paymentMethod");
  const selectedCountry = watch("shippingAddress.country");

  const onFormSubmit = async (data: CheckoutFormData) => {
    setServerError("");

    try {
      await onSubmit(data); // Changed: just await the promise, no result handling
    } catch (error) {
      console.error("Form submission error:", error);
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  const paymentMethods = [
    { value: "paypal", label: "PayPal", icon: Smartphone },
    { value: "card", label: "Credit/Debit Card", icon: CreditCard },
  ];

  const getPaymentMethodInfo = (method: string) => {
    const messages = {
      paypal: "You'll be redirected to PayPal to complete payment securely.",
      card: "Card payment coming soon. Please use PayPal for now.",
    };
    return messages[method as keyof typeof messages] || "";
  };

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "IL", label: "Israel" },
    { value: "CA", label: "Canada" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
    { value: "JP", label: "Japan" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {orderIsDigital
            ? "Customer Information"
            : "Shipping & Customer Information"}
        </CardTitle>
        <CardDescription>
          {orderIsDigital
            ? "Complete your details to receive your digital products"
            : "Please fill in your shipping and contact details"}
        </CardDescription>
        {orderIsDigital && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              📱 Digital products only - no shipping required!
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {serverError && (
          <div className="mb-6">
            <ErrorMessage
              message={serverError}
              variant="error"
              onDismiss={() => setServerError("")}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
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
              <Label htmlFor="customerEmail">
                Email Address <span className="text-red-500">*</span>
              </Label>
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
                  Digital products will be sent to this email
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address Section - Only for physical products */}
          {!orderIsDigital && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Shipping Address
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="shippingAddress.line1">
                    Street Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shippingAddress.line1"
                    type="text"
                    placeholder="123 Main Street"
                    className={
                      errors.shippingAddress?.line1 ? "border-red-500" : ""
                    }
                    disabled={isLoading}
                    {...register("shippingAddress.line1")}
                  />
                  {errors.shippingAddress?.line1 && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.shippingAddress.line1.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shippingAddress.line2">
                    Apartment, suite, etc. (optional)
                  </Label>
                  <Input
                    id="shippingAddress.line2"
                    type="text"
                    placeholder="Apt 4B"
                    disabled={isLoading}
                    {...register("shippingAddress.line2")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingAddress.city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shippingAddress.city"
                      type="text"
                      placeholder="New York"
                      className={
                        errors.shippingAddress?.city ? "border-red-500" : ""
                      }
                      disabled={isLoading}
                      {...register("shippingAddress.city")}
                    />
                    {errors.shippingAddress?.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.shippingAddress.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shippingAddress.state">
                      State / Province
                    </Label>
                    <Input
                      id="shippingAddress.state"
                      type="text"
                      placeholder="NY"
                      disabled={isLoading}
                      {...register("shippingAddress.state")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingAddress.postalCode">
                      Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shippingAddress.postalCode"
                      type="text"
                      placeholder="10001"
                      className={
                        errors.shippingAddress?.postalCode
                          ? "border-red-500"
                          : ""
                      }
                      disabled={isLoading}
                      {...register("shippingAddress.postalCode")}
                    />
                    {errors.shippingAddress?.postalCode && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.shippingAddress.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="shippingAddress.country">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedCountry || "US"}
                      onValueChange={(value) =>
                        setValue("shippingAddress.country", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className={
                          errors.shippingAddress?.country
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.shippingAddress?.country && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.shippingAddress.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Method
            </h3>

            <div>
              <Label>
                Select Payment Method <span className="text-red-500">*</span>
              </Label>
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
                Creating Order...
              </>
            ) : (
              "Continue to Payment"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
