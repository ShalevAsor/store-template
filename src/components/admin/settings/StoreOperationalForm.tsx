"use client";
// actions
import { updateSettingOperationalAction } from "@/lib/actions/settingActions";

// schemas
import {
  storeOperationalSchema,
  type StoreOperationalFormData,
} from "@/schemas/settingsSchema";

// hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";

// components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoreOperationalFormProps {
  initialData: StoreOperationalFormData;
  descriptions?: Partial<Record<keyof StoreOperationalFormData, string>>;
}

export function StoreOperationalForm({
  initialData,
  descriptions,
}: StoreOperationalFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<StoreOperationalFormData>({
    resolver: zodResolver(storeOperationalSchema),
    defaultValues: {
      currency: initialData.currency,
      taxRate: initialData.taxRate,
      standardShippingCost: initialData.standardShippingCost,
      freeShippingThreshold: initialData.freeShippingThreshold,
    },
  });

  const onSubmit = async (data: StoreOperationalFormData) => {
    startTransition(async () => {
      const result = await updateSettingOperationalAction(data);
      if (result.success) {
        toast.success(result.data?.message || "Settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {/* Currency */}
      <div className="grid gap-3">
        <Label htmlFor="store-currency">
          Store Currency <span className="text-destructive">*</span>{" "}
        </Label>
        <Input
          id="store-currency"
          {...register("currency")}
          placeholder="USD"
        />
        {descriptions?.currency && (
          <p className="text-sm text-muted-foreground">
            {descriptions.currency}
          </p>
        )}
        {errors.currency && (
          <p className="text-sm text-destructive">{errors.currency.message}</p>
        )}
      </div>
      {/* Tax Rate */}
      <div className="grid gap-3">
        <Label htmlFor="tax-rate">
          Tax Rate <span className="text-destructive">*</span>{" "}
        </Label>
        <Input id="tax-rate" {...register("taxRate")} placeholder="10" />
        {descriptions?.taxRate && (
          <p className="text-sm text-muted-foreground">
            {descriptions.taxRate}
          </p>
        )}
        {errors.taxRate && (
          <p className="text-sm text-destructive">{errors.taxRate.message}</p>
        )}
      </div>
      {/* Shipping Cost */}
      <div className="grid gap-3">
        <Label htmlFor="shipping-cost">
          Shipping Cost <span className="text-destructive">*</span>{" "}
        </Label>
        <Input
          id="shipping-cost"
          {...register("standardShippingCost")}
          placeholder="10"
        />
        {descriptions?.standardShippingCost && (
          <p className="text-sm text-muted-foreground">
            {descriptions.standardShippingCost}
          </p>
        )}
        {errors.standardShippingCost && (
          <p className="text-sm text-destructive">
            {errors.standardShippingCost.message}
          </p>
        )}
      </div>
      {/* Shipping Cost */}
      <div className="grid gap-3">
        <Label htmlFor="free-shipping-threshold">Free Shipping Threshold</Label>
        <Input
          id="free-shipping-threshold"
          {...register("freeShippingThreshold")}
          placeholder="10"
        />
        {descriptions?.freeShippingThreshold && (
          <p className="text-sm text-muted-foreground">
            {descriptions.freeShippingThreshold}
          </p>
        )}
        {errors.freeShippingThreshold && (
          <p className="text-sm text-destructive">
            {errors.freeShippingThreshold.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
