"use client";

import {
  useForm,
  useFieldArray,
  UseFormSetError,
  UseFormReset,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Image as ImageIcon } from "lucide-react";
import {
  productFormSchema,
  ProductFormData,
  defaultProductValues,
} from "@/schemas/productSchema";
import { ProductStatus } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/products/ImageUploadField";
import { FormCard } from "@/components/shared/FormCard";
import { uploadFileToS3 } from "@/lib/upload";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (
    data: ProductFormData,
    setError: UseFormSetError<ProductFormData>,
    reset?: UseFormReset<ProductFormData>
  ) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = defaultProductValues,
  onSubmit,
  isSubmitting: externalIsSubmitting = false,
  submitButtonText = "Save Product",
}) => {
  const [pendingFiles, setPendingFiles] = useState<Map<number, File>>(
    new Map()
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const isDigital = watch("isDigital");
  const status = watch("status");

  const handleFormSubmit = async (data: ProductFormData) => {
    const hasPendingUploads = data.images.some(
      (img) => img.imageKey === "pending-upload"
    );
    if (hasPendingUploads && pendingFiles.size === 0) {
      toast.error("Please select your images again");
      return;
    }

    try {
      productFormSchema.parse(data);
    } catch (error) {
      console.error("ProductForm validation failed:", error);
      return; // react hook form handle the error display
    }
    if (pendingFiles.size === 0) {
      // No files to upload, submit directly
      await onSubmit(data, setError, reset);
      return;
    }

    setIsUploading(true);

    try {
      // Upload all pending files in parallel
      const uploadPromises: Promise<{ index: number; key: string }>[] = [];

      pendingFiles.forEach((file, index) => {
        const uploadPromise = uploadFileToS3(file).then((key) => ({
          index,
          key,
        }));
        uploadPromises.push(uploadPromise);
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);

      // Update form data with S3 keys
      const updatedImages = data.images.map((img, index) => {
        const uploadResult = uploadResults.find(
          (result) => result.index === index
        );
        if (uploadResult) {
          return { ...img, imageKey: uploadResult.key };
        }
        return img;
      });

      // Submit with S3 keys
      const dataWithImageKeys = { ...data, images: updatedImages };
      await onSubmit(dataWithImageKeys, setError, reset);

      // Clear pending files on success
      setPendingFiles(new Map());
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error("Failed to upload images. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const addImageField = () => {
    if (hasEmptyFields) {
      toast.error(
        "Please select an image for existing fields before adding more"
      );
      return;
    }
    const maxSortOrder =
      fields.length > 0
        ? Math.max(...fields.map((field) => field.sortOrder || 0))
        : -1;

    append({
      imageKey: "",
      altText: "",
      sortOrder: maxSortOrder + 1,
    });
  };

  const handleImageChange = (index: number, file: File | null) => {
    const newPendingFiles = new Map(pendingFiles);

    if (file) {
      newPendingFiles.set(index, file);
      // Set temporary value for form validation
      setValue(`images.${index}.imageKey`, "pending-upload", {
        shouldValidate: true,
      });
    } else {
      newPendingFiles.delete(index);
      setValue(`images.${index}.imageKey`, "", {
        shouldValidate: true,
      });
    }

    setPendingFiles(newPendingFiles);
  };

  const getImageValue = (index: number): File | string => {
    const pendingFile = pendingFiles.get(index);
    if (pendingFile) return pendingFile;

    const formValue = watch(`images.${index}.imageKey`);
    return formValue || "";
  };

  const hasEmptyFields = fields.some((_, index) => {
    const imageValue = getImageValue(index);
    return !imageValue || imageValue === "";
  });

  const removeImageField = (index: number) => {
    // Clean up pending file
    const newPendingFiles = new Map(pendingFiles);
    newPendingFiles.delete(index);
    setPendingFiles(newPendingFiles);

    // Remove from form
    remove(index);
  };

  const isFormSubmitting = externalIsSubmitting || isUploading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <FormCard title="Basic Information">
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            autoComplete="off"
            {...register("name")}
            placeholder="Enter product name"
            disabled={isFormSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            autoComplete="off"
            {...register("description")}
            placeholder="Describe your product..."
            rows={4}
            disabled={isFormSubmitting}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              autoComplete="off"
              {...register("sku")}
              placeholder="Product SKU"
              disabled={isFormSubmitting}
            />
            {errors.sku && (
              <p className="text-sm text-red-600">{errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              autoComplete="off"
              {...register("category")}
              placeholder="Product category"
              disabled={isFormSubmitting}
            />
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>
      </FormCard>

      {/* Pricing */}
      <FormCard title="Pricing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">
              Price <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                autoComplete="off"
                className="pl-8"
                disabled={isFormSubmitting}
              />
            </div>
            {/* Price is entered in dollars and automatically converted to cents for storage */}
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="compareAtPrice">Compare At Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                autoComplete="off"
                {...register("compareAtPrice", {
                  setValueAs: (value) => {
                    if (value === "" || value === null || value === undefined)
                      return null;
                    const num = Number(value);
                    return isNaN(num) ? null : num;
                  },
                })}
                placeholder="0.00"
                className="pl-8"
                disabled={isFormSubmitting}
              />
            </div>
            {errors.compareAtPrice && (
              <p className="text-sm text-red-600">
                {errors.compareAtPrice.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Original price for showing discounts
            </p>
          </div>
        </div>
      </FormCard>

      {/* Inventory & Type */}
      <FormCard title="Inventory & Type">
        <div className="flex items-center space-x-2">
          <Switch
            id="isDigital"
            checked={isDigital}
            disabled={isFormSubmitting}
            onCheckedChange={(checked) => {
              setValue("isDigital", checked);
              if (checked) {
                setValue("stock", null);
              }
            }}
          />
          <div className="space-y-1">
            <Label htmlFor="isDigital">Digital Product</Label>
            <p className="text-sm text-gray-500">
              {"Digital products don't require inventory tracking"}
            </p>
          </div>
        </div>

        {!isDigital && (
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              autoComplete="off"
              {...register("stock", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined)
                    return null;
                  const num = Number(value);
                  return isNaN(num) ? null : num;
                },
              })}
              placeholder="Leave empty for unlimited stock"
              disabled={isFormSubmitting}
            />
            {errors.stock && (
              <p className="text-sm text-red-600">{errors.stock.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Leave empty for unlimited stock, set to 0 for out of stock
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={status}
            onValueChange={(value: ProductStatus) => setValue("status", value)}
            disabled={isFormSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ProductStatus.DRAFT}>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Draft</Badge>
                  <span>Hidden from customers</span>
                </div>
              </SelectItem>
              <SelectItem value={ProductStatus.ACTIVE}>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <span>Available for purchase</span>
                </div>
              </SelectItem>
              <SelectItem value={ProductStatus.ARCHIVED}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Archived</Badge>
                  <span>Hidden but not deleted</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </FormCard>

      {/* Images */}
      <FormCard
        title="Product Images"
        headerContent={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
            disabled={isFormSubmitting || hasEmptyFields}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </Button>
        }
        contentClassName=""
      >
        {fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No images added yet</p>
            <Button
              type="button"
              variant="outline"
              onClick={addImageField}
              disabled={isFormSubmitting}
            >
              Add First Image
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`images.${index}.imageKey`}>
                        Image <span className="text-red-500">*</span>
                      </Label>
                      <ImageUploadField
                        value={getImageValue(index)}
                        onChange={(file) => handleImageChange(index, file)}
                        onClear={() => handleImageChange(index, null)}
                        disabled={isFormSubmitting}
                      />
                      {errors.images?.[index]?.imageKey && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.images[index]?.imageKey?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`images.${index}.altText`}>
                        Alt Text
                      </Label>
                      <Input
                        {...register(`images.${index}.altText`)}
                        placeholder="Describe the image for accessibility"
                        disabled={isFormSubmitting}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageField(index)}
                    disabled={isFormSubmitting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Images will be uploaded when you submit the form
        </p>
      </FormCard>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isFormSubmitting}
          className="min-w-[120px]"
        >
          {isUploading
            ? "Uploading..."
            : isFormSubmitting
            ? "Saving..."
            : submitButtonText}
        </Button>
      </div>
    </form>
  );
};
