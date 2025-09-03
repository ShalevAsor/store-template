"use client";

import {
  useForm,
  useFieldArray,
  UseFormSetError,
  UseFormReset,
} from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Image as ImageIcon } from "lucide-react";
import {
  productFormSchema,
  ProductFormData,
  defaultProductValues,
} from "@/schemas/productSchema";
import { ProductStatus } from "@prisma/client";

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

/**
 * Reusable product form component for creating and editing products
 *
 * @param initialData - Pre-populated data for edit mode
 * @param onSubmit - Handler for form submission
 * @param isSubmitting - Loading state for submit button
 * @param submitButtonText - Custom text for submit button
 */
export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = defaultProductValues,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Save Product",
}) => {
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

  // Watch isDigital to conditionally show/hide stock field
  const isDigital = watch("isDigital");
  const status = watch("status");

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data, setError, reset);
  };

  const addImageField = () => {
    append({
      imageUrl: "",
      altText: "",
      sortOrder: fields.length,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your product..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* SKU and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} placeholder="Product SKU" />
              {errors.sku && (
                <p className="text-sm text-red-600">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="Product category"
              />
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
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
                  className="pl-8"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Compare At Price */}
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
                  {...register("compareAtPrice", {
                    valueAsNumber: true,
                    setValueAs: (value) => (value === "" ? null : value),
                  })}
                  placeholder="0.00"
                  className="pl-8"
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
        </CardContent>
      </Card>

      {/* Inventory & Type */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory & Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Type Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isDigital"
              checked={isDigital}
              onCheckedChange={(checked) => {
                setValue("isDigital", checked);
                // Clear stock when switching to digital
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

          {/* Stock - Only show for physical products */}
          {!isDigital && (
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...register("stock", {
                  valueAsNumber: true,
                  setValueAs: (value) => (value === "" ? null : value),
                })}
                placeholder="Leave empty for unlimited stock"
              />
              {errors.stock && (
                <p className="text-sm text-red-600">{errors.stock.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Leave empty for unlimited stock, set to 0 for out of stock
              </p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value: ProductStatus) =>
                setValue("status", value)
              }
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
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
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
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Product Images
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImageField}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No images added yet</p>
              <Button type="button" variant="outline" onClick={addImageField}>
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
                        <Label htmlFor={`images.${index}.imageUrl`}>
                          Image URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          {...register(`images.${index}.imageUrl`)}
                          placeholder="https://example.com/image.jpg"
                        />
                        {errors.images?.[index]?.imageUrl && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.images[index]?.imageUrl?.message}
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
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
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
            Temporary: Enter image URLs. S3 upload will be implemented later.
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
};
