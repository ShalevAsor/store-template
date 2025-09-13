import { PaginationMeta } from "@/types/common";

/**
 * Validates and normalizes pagination parameters
 */
export function validatePaginationParams(page: number, limit: number) {
  const currentPage = Math.max(1, page);
  const take = Math.max(1, limit);
  const skip = (currentPage - 1) * take;

  return {
    currentPage,
    take,
    skip,
  };
}

/**
 * Calculates pagination metadata based on current page, limit, and total count
 */

export const calculatePagination = (
  currentPage: number,
  limit: number,
  totalItems: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    page: currentPage,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

/**
 * Returns default pagination metadata for error cases
 */
export function getDefaultPagination(limit: number): PaginationMeta {
  return {
    page: 1,
    limit,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}
