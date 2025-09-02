"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterSelect } from "../shared/FilterSelect";
import {
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "@/constants/selectOptions";

interface ProductsSearchFilterProps {
  initialSearch?: string;
  initialProductType?: string;
  initialStatus?: string;
}

export const ProductsSearchFilter: React.FC<ProductsSearchFilterProps> = ({
  initialSearch = "",
  initialProductType = "all",
  initialStatus = "all",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for inputs
  const [search, setSearch] = useState(initialSearch);
  const [productType, setProductType] = useState(initialProductType);
  const [status, setStatus] = useState(initialStatus);

  // Debounce the search value - only update URL after 500ms of no typing
  const debouncedSearch = useDebounce(search, 500);

  // Initialize state from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlProductType = searchParams.get("productType") || "all";
    const urlStatus = searchParams.get("status") || "all";

    setSearch(urlSearch);
    setProductType(urlProductType);
    setStatus(urlStatus);
  }, [searchParams]);

  // Create URL with current filters
  const createFilterUrl = (
    newSearch: string,
    newProductType: string,
    newStatus: string
  ) => {
    const params = new URLSearchParams(searchParams);

    // Set search parameter
    if (newSearch.trim()) {
      params.set("search", newSearch.trim());
    } else {
      params.delete("search");
    }

    // Set product type parameter
    if (newProductType && newProductType !== "all") {
      params.set("productType", newProductType);
    } else {
      params.delete("productType");
    }

    // Set status parameter
    if (newStatus && newStatus !== "all") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    // Reset to page 1 when filters change
    params.set("page", "1");
    return `?${params.toString()}`;
  };

  // Handle search changes via debounced value
  useEffect(() => {
    // Only update URL if the debounced search value is different from URL
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      router.push(createFilterUrl(debouncedSearch, productType, status));
    }
  }, [debouncedSearch, productType, status, router, searchParams]);

  // Handle product type change immediately
  const handleProductTypeChange = (newProductType: string) => {
    setProductType(newProductType);
    router.push(createFilterUrl(search, newProductType, status));
  };

  // Handle status change immediately
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    router.push(createFilterUrl(search, productType, newStatus));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setProductType("all");
    setStatus("all");
    // Navigate to clean URL with just page = 1
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  // Check if any filters are active
  const hasActiveFilters =
    search.trim() !== "" || productType !== "all" || status !== "all";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search input */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name, description, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />

            {/* Product Type Filter */}
            <FilterSelect
              value={productType}
              onValueChange={handleProductTypeChange}
              options={PRODUCT_TYPE_OPTIONS}
              placeholder="Product type"
              className="w-full sm:w-[140px]"
              aria-label="Filter by product type"
            />

            {/* Status Filter */}
            <FilterSelect
              value={status}
              onValueChange={handleStatusChange}
              options={PRODUCT_STATUS_OPTIONS}
              placeholder="Status"
              className="w-full sm:w-[120px]"
              aria-label="Filter by status"
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
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

            {status !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Status:{" "}
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
