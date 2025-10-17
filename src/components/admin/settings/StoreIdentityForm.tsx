"use client";

// actions
import { updateStoreIdentityAction } from "@/lib/actions/settingActions";

// schemas
import {
  storeIdentitySchema,
  type StoreIdentityFormData,
} from "@/schemas/settingsSchema";

// hooks
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

// components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StoreIdentityFormProps {
  initialData: StoreIdentityFormData;
  descriptions?: Partial<Record<keyof StoreIdentityFormData, string>>;
}

export function StoreIdentityForm({
  initialData,
  descriptions,
}: StoreIdentityFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<StoreIdentityFormData>({
    resolver: zodResolver(storeIdentitySchema),
    defaultValues: {
      storeName: initialData.storeName,
      storeDescription: initialData.storeDescription,
      contactEmail: initialData.contactEmail,
    },
  });

  const onSubmit = async (data: StoreIdentityFormData) => {
    startTransition(async () => {
      const result = await updateStoreIdentityAction(data);

      if (result.success) {
        toast.success(result.data?.message || "Settings saved successfully");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {/* Store Name */}
      <div className="grid gap-3">
        <Label htmlFor="store-name">
          Store Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="store-name"
          {...register("storeName")}
          placeholder="My Amazing Store"
        />
        {descriptions?.storeName && (
          <p className="text-sm text-muted-foreground">
            {descriptions.storeName}
          </p>
        )}
        {errors.storeName && (
          <p className="text-sm text-destructive">{errors.storeName.message}</p>
        )}
      </div>

      {/* Store Description */}
      <div className="grid gap-3">
        <Label htmlFor="store-description">Store Description</Label>
        <Textarea
          id="store-description"
          {...register("storeDescription")}
          placeholder="Tell customers about your store..."
          rows={4}
        />
        {descriptions?.storeName && (
          <p className="text-sm text-muted-foreground">
            {descriptions.storeDescription}
          </p>
        )}
        {errors.storeDescription && (
          <p className="text-sm text-destructive">
            {errors.storeDescription.message}
          </p>
        )}
      </div>

      {/* Contact Email */}
      <div className="grid gap-3">
        <Label htmlFor="contact-email">
          Contact Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="contact-email"
          type="email"
          {...register("contactEmail")}
          placeholder="contact@example.com"
        />
        {descriptions?.storeName && (
          <p className="text-sm text-muted-foreground">
            {descriptions.contactEmail}
          </p>
        )}
        {errors.contactEmail && (
          <p className="text-sm text-destructive">
            {errors.contactEmail.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Saving..." : "Save Store Identity"}
      </Button>
    </form>
  );
}
