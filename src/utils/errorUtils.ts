import { Prisma } from "@prisma/client";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "A product with this SKU already exists";
      case "P2003":
        return "Invalid reference - some data may no longer exist";
      case "P2025":
        return "Product not found";
      default:
        return "Database error occurred";
    }
  }

  if (error instanceof Error) {
    return error.message || "Unknown error";
  }

  return "Unknown error";
}
