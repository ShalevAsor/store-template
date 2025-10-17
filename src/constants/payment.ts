// export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
// export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

// export const PAYPAL_API_URL =
//   process.env.NODE_ENV === "production" &&
//   process.env.PAYPAL_ENVIRONMENT === "production"
//     ? "https://api-m.paypal.com"
//     : "https://api-m.sandbox.paypal.com";
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
export const PAYPAL_API_URL =
  process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
