import { prisma } from "@/lib/prisma";
import {
  OrdersPaginationResult,
  OrderSearchFilters,
  OrderWithItems,
} from "@/types/order";
import {
  calculatePagination,
  getDefaultPagination,
  validatePaginationParams,
} from "@/utils/paginationUtils";
import { Prisma } from "@prisma/client";

/**
 * Get order by ID with order items
 */
export async function getOrder(
  orderId: string
): Promise<OrderWithItems | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

/**
 * Get orders by customer email
 */
export async function getOrdersByEmail(
  email: string
): Promise<OrderWithItems[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

/**
 * Get recent orders (for admin dashboard)
 */
export async function getRecentOrders(
  limit: number = 10
): Promise<OrderWithItems[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return orders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }
}

/**
 * returns orders with pagination, search, and filtering for admin
 */

export async function getOrdersWithPagination(
  page: number = 1,
  limit: number = 10,
  filters: OrderSearchFilters
): Promise<OrdersPaginationResult> {
  const { currentPage, take, skip } = validatePaginationParams(page, limit);
  try {
    // Build where clause for search filter
    const whereClause: Prisma.OrderWhereInput = {};

    const searchTerm = filters.search?.trim();
    if (searchTerm) {
      whereClause.OR = [
        { customerName: { contains: searchTerm, mode: "insensitive" } },
        { customerEmail: { contains: searchTerm, mode: "insensitive" } },
        { customerPhone: { contains: searchTerm, mode: "insensitive" } },
        { orderNumber: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Order status filter
    if (filters.status && filters.status !== "all") {
      whereClause.status = filters.status;
    }

    // Order type filter
    if (filters.type === "digital_only") {
      whereClause.isDigital = true;
    }
    if (filters.type === "has_physical") {
      whereClause.isDigital = false;
    }

    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      whereClause.paymentStatus = filters.paymentStatus;
    }

    // Get orders and total count in parallel with filters applied
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: { orderItems: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    // Calculate pagination metadata using utility
    const pagination = calculatePagination(currentPage, take, total);

    return {
      orders,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching orders with pagination:", error);
    return {
      orders: [],
      pagination: getDefaultPagination(limit),
    };
  }
}
