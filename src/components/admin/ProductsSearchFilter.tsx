"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterSelect } from "../shared/FilterSelect";
import { PRODUCT_TYPE_OPTIONS } from "@/constants/selectOptions";

interface ProductsSearchFilterProps {
  // Fixed typo in interface name
  initialSearch?: string;
  initialProductType?: string;
}

export const ProductsSearchFilter: React.FC<ProductsSearchFilterProps> = ({
  initialSearch = "",
  initialProductType = "all", // Changed default to "all"
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for inputs
  const [search, setSearch] = useState(initialSearch);
  const [productType, setProductType] = useState(initialProductType);

  // Debounce the search value - only update URL after 500ms of no typing
  const debouncedSearch = useDebounce(search, 500);

  // Initialize state from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlProductType = searchParams.get("productType") || "all";

    setSearch(urlSearch);
    setProductType(urlProductType);
  }, [searchParams]);

  // Create URL with current filters
  const createFilterUrl = (newSearch: string, newProductType: string) => {
    const params = new URLSearchParams(searchParams);

    // Set search parameter (FIXED: was "serach", now "search")
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }

    // Set product type parameter (FIXED: was checking productType, now checking newProductType)
    if (newProductType && newProductType !== "all") {
      params.set("productType", newProductType);
    } else {
      params.delete("productType");
    }

    // Reset to page 1 when filters change
    params.set("page", "1");
    return `?${params.toString()}`;
  };

  // Handle search changes via debounced value
  useEffect(() => {
    // Only update URL if the debounced search value is different from URL
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      router.push(createFilterUrl(debouncedSearch, productType));
    }
  }, [debouncedSearch, productType, router, searchParams]);

  // Handle product type change immediately
  const handleProductTypeChange = (newProductType: string) => {
    setProductType(newProductType);
    router.push(createFilterUrl(search, newProductType));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setProductType("all");
    // Navigate to clean URL with just page = 1
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  // Check if any filters are active
  const hasActiveFilters = search.trim() !== "" || productType !== "all";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search input */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Product Type Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
            <FilterSelect
              value={productType}
              onValueChange={handleProductTypeChange}
              options={PRODUCT_TYPE_OPTIONS}
              placeholder="Product type"
              className="w-full sm:w-[180px]"
              aria-label="Filter by product type"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-gray-500">Active filters:</span>

            {search.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{search.trim()}"
              </span>
            )}

            {productType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Type: {productType === "digital" ? "Digital" : "Physical"}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
