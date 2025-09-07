"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@prisma/client";
import { Button } from "../ui/button";
import { getImageUrl } from "@/lib/images";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  className,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Sync carousel state when API is ready or selection changes
  useEffect(() => {
    if (!api) {
      return;
    }

    // Set initial current index
    setCurrent(api.selectedScrollSnap());

    // Listen for selection changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    // Cleanup
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Handle carousel state changes properly
  useEffect(() => {
    if (!api) {
      return;
    }

    // Set initial state
    setCurrent(api.selectedScrollSnap());

    // Listen for selection changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    // Cleanup listener
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          <ImagePlaceholder size="xl" />
        </div>
      </div>
    );
  }

  // Single image - no carousel needed
  if (images.length === 1) {
    const mainImage = getImageUrl(images[0].imageKey);
    return (
      <div className={cn("space-y-4", className)}>
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={mainImage}
            alt={images[0].altText || productName}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Carousel */}
      <div className="relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(image.imageKey)}
                    alt={image.altText || `${productName} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation arrows - only show if multiple images */}
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>

        {/* Image counter */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <Button
            key={image.id}
            onClick={() => handleThumbnailClick(index)}
            className={cn(
              "flex-shrink-0 w-20 h-20 relative bg-gray-100 rounded-md overflow-hidden border-2 transition-all",
              current === index
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <Image
              src={getImageUrl(image.imageKey)}
              alt={image.altText || `${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />

            {/* Overlay for non-active thumbnails */}
            {current !== index && (
              <div className="absolute inset-0 bg-black/20" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};
