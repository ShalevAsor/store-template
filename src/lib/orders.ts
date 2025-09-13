import { prisma } from "@/lib/prisma";
import {
  CreateOrderData,
  SerializedOrder,
  OrderStatus,
  OrdersPaginationResult,
  OrderSearchFilters,
} from "@/types/order";
import { generateOrderNumber, serializeOrder } from "@/utils/orderUtils";
import {
  calculatePagination,
  getDefaultPagination,
  validatePaginationParams,
} from "@/utils/paginationUtils";
import { Prisma } from "@prisma/client";

/**
 * Create a new order with order items
 */
export async function createOrder(
  orderData: CreateOrderData
): Promise<SerializedOrder> {
  try {
    // Calculate total amount
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order with order items and update stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Validate and update stock for each item
      for (const item of orderData.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productName} not found`);
        }

        // Check stock availability (only for products with limited stock)
        if (product.stock !== null) {
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }

          // Update stock - decrement by purchased quantity
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Create the order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          isDigital: orderData.isDigital,
          totalAmount,
          orderItems: {
            create: orderData.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      return createdOrder;
    });

    // Convert to serialized format
    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    };
  } catch (error) {
    console.error("Error creating order:", error);

    // Re-throw the error with more context
    if (error instanceof Error) {
      throw error; // Preserve the original error message
    }

    throw new Error("Failed to create order");
  }
}

/**
 * Get order by ID with order items
 */
export async function getOrder(
  orderId: string
): Promise<SerializedOrder | null> {
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

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    };
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
): Promise<SerializedOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: email },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<SerializedOrder | null> {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: true,
      },
    });

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return null;
  }
}

/**
 * Get recent orders (for admin dashboard)
 */
export async function getRecentOrders(
  limit: number = 10
): Promise<SerializedOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));
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

    // Serialize orders for client components
    const serializedOrders = orders.map(serializeOrder);

    // Calculate pagination metadata using utility
    const pagination = calculatePagination(currentPage, take, total);

    return {
      orders: serializedOrders,
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
