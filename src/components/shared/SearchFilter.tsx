// components/shared/SearchFilter.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterSelect } from "./FilterSelect";

// Filter configuration interface
export interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
  ariaLabel?: string;
}

// Active filter display configuration
export interface ActiveFilterConfig {
  key: string;
  label: string;
  displayValue: string;
  colorClass: string;
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  filters: FilterConfig[];
  initialValues: Record<string, string>;
  onFiltersChange?: (filters: Record<string, string>) => void;
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchPlaceholder = "Search...",
  filters,
  initialValues,
  onFiltersChange,
  className = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for inputs
  const [search, setSearch] = useState(initialValues.search || "");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => {
      const values: Record<string, string> = {};
      filters.forEach((filter) => {
        values[filter.key] = initialValues[filter.key] || "all";
      });
      return values;
    }
  );

  // Debounce the search value - only update URL after 500ms of no typing
  const debouncedSearch = useDebounce(search, 500);

  // Initialize state from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlFilters: Record<string, string> = {};

    filters.forEach((filter) => {
      urlFilters[filter.key] = searchParams.get(filter.key) || "all";
    });

    setSearch(urlSearch);
    setFilterValues(urlFilters);
  }, [searchParams, filters]);

  // Create URL with current filters
  const createFilterUrl = useCallback(
    (newSearch: string, newFilterValues: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);

      // Set search parameter
      if (newSearch.trim()) {
        params.set("search", newSearch.trim());
      } else {
        params.delete("search");
      }

      // Set filter parameters
      filters.forEach((filter) => {
        const value = newFilterValues[filter.key];
        if (value && value !== "all") {
          params.set(filter.key, value);
        } else {
          params.delete(filter.key);
        }
      });

      // Reset to page 1 when filters change
      params.set("page", "1");
      return `?${params.toString()}`;
    },
    [searchParams, filters]
  );

  // Handle search changes via debounced value
  useEffect(() => {
    // Only update URL if the debounced search value is different from URL
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      const newUrl = createFilterUrl(debouncedSearch, filterValues);
      router.push(newUrl);
      onFiltersChange?.({ search: debouncedSearch, ...filterValues });
    }
  }, [
    debouncedSearch,
    filterValues,
    router,
    searchParams,
    createFilterUrl,
    onFiltersChange,
  ]);

  // Handle filter change
  const handleFilterChange = (filterKey: string, newValue: string) => {
    const newFilterValues = { ...filterValues, [filterKey]: newValue };
    setFilterValues(newFilterValues);

    const newUrl = createFilterUrl(search, newFilterValues);
    router.push(newUrl);
    onFiltersChange?.({ search, ...newFilterValues });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    const clearedFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      clearedFilters[filter.key] = "all";
    });
    setFilterValues(clearedFilters);

    // Navigate to clean URL with just page = 1
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    onFiltersChange?.({ search: "", ...clearedFilters });
  };

  // Check if any filters are active
  const hasActiveFilters =
    search.trim() !== "" ||
    Object.values(filterValues).some((value) => value !== "all");

  // Get active filters for display
  const getActiveFilters = (): ActiveFilterConfig[] => {
    const activeFilters: ActiveFilterConfig[] = [];

    // Add search filter if active
    if (search.trim()) {
      activeFilters.push({
        key: "search",
        label: "Search",
        displayValue: `"${search.trim()}"`,
        colorClass: "bg-blue-100 text-blue-800",
      });
    }

    // Add active filters
    filters.forEach((filter) => {
      const value = filterValues[filter.key];
      if (value && value !== "all") {
        const option = filter.options.find((opt) => opt.value === value);
        if (option) {
          activeFilters.push({
            key: filter.key,
            label: filter.label,
            displayValue: option.label,
            colorClass: getColorClass(filter.key),
          });
        }
      }
    });

    return activeFilters;
  };

  // Get color class for filter chips
  const getColorClass = (filterKey: string): string => {
    const colorMap: Record<string, string> = {
      productType: "bg-green-100 text-green-800",
      status: "bg-purple-100 text-purple-800",
      paymentStatus: "bg-orange-100 text-orange-800",
      orderStatus: "bg-red-100 text-red-800",
    };
    return colorMap[filterKey] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search input */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />

            {/* Dynamic Filters */}
            {filters.map((filter) => (
              <FilterSelect
                key={filter.key}
                value={filterValues[filter.key]}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
                options={filter.options}
                placeholder={filter.placeholder}
                className={filter.className || "w-full sm:w-[140px]"}
                aria-label={
                  filter.ariaLabel || `Filter by ${filter.label.toLowerCase()}`
                }
              />
            ))}

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
            {getActiveFilters().map((filter) => (
              <span
                key={filter.key}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${filter.colorClass}`}
              >
                {filter.label}: {filter.displayValue}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
