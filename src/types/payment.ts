/**
 * Input data for creating a PayPal order
 */
export interface CreatePayPalOrderData {
  orderNumber: string; // Human-readable order number (e.g., "ORD-001") - goes to PayPal's custom_id
  totalAmount: number; // Total price in cents (e.g., $10.50 = 1050)
  currency: string; // "USD", "EUR", etc.
  customerName: string; // Customer name
  customerEmail: string; // Customer email
  isDigital: boolean; // true = digital products, false = physical products
  shippingAddress?: string; // Your existing Prisma field (string)
}

/**
 * PayPal API response types
 */
export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer: {
    email_address: string;
    payer_id: string;
  };
  purchase_units: Array<{
    reference_id?: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export interface PayPalPurchaseUnit {
  reference_id: string;
  description: string;
  custom_id: string; // This is where your order number goes for tracking
  amount: {
    currency_code: string;
    value: string;
  };
}
