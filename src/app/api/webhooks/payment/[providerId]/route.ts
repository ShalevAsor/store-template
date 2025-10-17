import { NextRequest, NextResponse } from "next/server";
import { getPaymentService } from "@/services/payment/PaymentService";
import { updateOrderFromWebhook } from "@/lib/actions/orderActions";

type RouteContext = {
  params: Promise<{ providerId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { providerId } = await context.params;

  try {
    console.log(`Received webhook from provider: ${providerId}`);

    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Get signature from headers (provider-specific)
    const signature = getSignatureFromHeaders(request, providerId);

    // Get payment service and process webhook
    const paymentService = await getPaymentService();
    const result = await paymentService.processWebhook(
      providerId,
      payload,
      signature
    );

    console.log("Webhook processing result:", {
      providerId,
      processed: result.processed,
      shouldUpdateOrder: result.shouldUpdateOrder,
      eventType: result.event?.eventType,
      payerEmail: result.orderUpdate?.payerEmail,
    });

    // Update order if needed
    if (result.shouldUpdateOrder && result.orderUpdate) {
      await updateOrderFromWebhook(result.orderUpdate);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json(
      {
        received: true,
        processed: result.processed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Webhook error for ${providerId}:`, error);

    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json(
      {
        received: true,
        processed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}

/**
 * Extract signature from headers based on provider
 */
function getSignatureFromHeaders(
  request: NextRequest,
  providerId: string
): string | undefined {
  switch (providerId.toLowerCase()) {
    case "paypal":
      // PayPal sends multiple headers for verification
      return JSON.stringify({
        transmissionId: request.headers.get("paypal-transmission-id"),
        transmissionTime: request.headers.get("paypal-transmission-time"),
        certUrl: request.headers.get("paypal-cert-url"),
        authAlgo: request.headers.get("paypal-auth-algo"),
        transmissionSig: request.headers.get("paypal-transmission-sig"),
      });

    case "stripe":
      return request.headers.get("stripe-signature") || undefined;

    default:
      return undefined;
  }
}
