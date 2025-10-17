// import { Prisma } from "@prisma/client";

// export function getErrorMessage(error: unknown): string {
//   if (error instanceof Prisma.PrismaClientKnownRequestError) {
//     switch (error.code) {
//       case "P2002":
//         // Unique constraint violation
//         const target = error.meta?.target as string[] | undefined;
//         if (target?.includes("sku")) {
//           return "A product with this SKU already exists";
//         }
//         if (target?.includes("orderNumber")) {
//           return "Order number conflict. Please try again.";
//         }
//         return "This record already exists";
//       case "P2003":
//         // Foreign key constraint violation
//         return "Invalid reference - some data may no longer exist";
//       case "P2025":
//         // Record not found
//         return "Record not found";
//       case "P2034":
//         // Transaction conflict
//         return "A conflict occurred while processing. Please try again.";
//       default:
//         console.error("Unhandled Prisma error:", error.code, error.message);
//         return "Database error occurred";
//     }
//   }
//   if (error instanceof Prisma.PrismaClientUnknownRequestError) {
//     console.error("Unknown Prisma error:", error.message);
//     return "Database connection error";
//   }
//   if (error instanceof Prisma.PrismaClientValidationError) {
//     console.error("Prisma validation error:", error.message);
//     return "Invalid data format";
//   }

//   if (error instanceof Error) {
//     return error.message || "Unknown error";
//   }

//   return "Unknown error";
// }

// type ErrorOptions = {
//   error?: unknown;
//   message?: string;
// };

// /**
//  * Helper to create consistent error ActionResult
//  */
// export function createErrorResult(opts: ErrorOptions) {
//   return {
//     success: false,
//     error: opts.message || getErrorMessage(opts.error) || "Unknown Error",
//   };
// }
// utils/errorUtils.ts
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function getErrorMessage(error: unknown): string {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.issues[0]; // ✅ Use 'issues' not 'errors'
    return firstError?.message || "Invalid data provided";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("sku")) {
          return "A product with this SKU already exists";
        }
        if (target?.includes("orderNumber")) {
          return "Order number conflict. Please try again.";
        }
        if (target?.includes("key")) {
          return "This setting key already exists";
        }
        return "This record already exists";
      case "P2003":
        return "Invalid reference - some data may no longer exist";
      case "P2025":
        return "Record not found";
      case "P2034":
        return "A conflict occurred while processing. Please try again.";
      default:
        console.error("Unhandled Prisma error:", error.code, error.message);
        return "Database error occurred";
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error("Unknown Prisma error:", error.message);
    return "Database connection error";
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("Prisma validation error:", error.message);
    return "Invalid data format";
  }

  if (error instanceof Error) {
    return error.message || "Unknown error";
  }

  return "Unknown error";
}

type ErrorOptions = {
  error?: unknown;
  message?: string;
};

export function createErrorResult(opts: ErrorOptions) {
  return {
    success: false,
    error: opts.message || getErrorMessage(opts.error) || "Unknown Error",
  };
}
