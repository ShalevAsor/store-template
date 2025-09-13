// components/admin/ImageUploadField.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/images";

interface ImageUploadFieldProps {
  value?: File | string;
  onChange: (file: File | null) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  onClear,
  disabled = false,
}: ImageUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle preview URL
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    if (value instanceof File) {
      // Create preview for new file
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);

      // Cleanup
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string" && value !== "pending-upload") {
      // Use existing S3 image
      setPreviewUrl(getImageUrl(value));
    }
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    setError(null);
    onChange(file);
    event.target.value = "";
  };

  const handleClear = () => {
    setError(null);
    onChange(null);
    onClear?.();
  };

  const hasValue =
    value &&
    (value instanceof File || (typeof value === "string" && value.length > 0));

  return (
    <div className="space-y-3">
      {hasValue ? (
        <div className="space-y-3">
          {previewUrl && (
            <div className="relative inline-block">
              <Image
                src={previewUrl}
                alt="Preview"
                width={96}
                height={96}
                className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                unoptimized={value instanceof File}
              />
              {value instanceof File && (
                <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  New
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {value instanceof File ? value.name : "Current image"}
              </p>
              {value instanceof File && (
                <p className="text-xs text-gray-500">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={disabled}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500">
            JPEG, PNG or WebP. Max size 5MB.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
