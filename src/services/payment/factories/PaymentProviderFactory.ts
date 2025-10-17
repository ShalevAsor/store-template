// src/services/payment/factories/PaymentProviderFactory.ts

import { PaymentProvider } from "../core/PaymentProvider";
import { PaymentProviderConfig } from "../core/PaymentConfig";
import { PayPalProvider } from "@/services/payment/providers/PayPalProvider";

/**
 * Factory for creating payment providers
 * Implements the Factory pattern to abstract provider creation
 */
export interface PaymentProviderFactory {
  /**
   * Create a payment provider instance
   */
  createProvider(
    providerId: string,
    config: PaymentProviderConfig
  ): Promise<PaymentProvider>;

  /**
   * Get list of supported provider IDs
   */
  getSupportedProviders(): string[];

  /**
   * Register a new provider
   */
  registerProvider(
    providerId: string,
    providerClass: new () => PaymentProvider
  ): void;
}

/**
 * Default implementation of PaymentProviderFactory
 */
export class DefaultPaymentProviderFactory implements PaymentProviderFactory {
  private providers = new Map<string, new () => PaymentProvider>();

  constructor() {
    // Register built-in providers
    this.registerProvider("paypal", PayPalProvider);
    // Future providers will be registered here:
    // this.registerProvider('stripe', StripeProvider);
    // this.registerProvider('square', SquareProvider);
  }

  /**
   * Create and initialize a payment provider
   */
  async createProvider(
    providerId: string,
    config: PaymentProviderConfig
  ): Promise<PaymentProvider> {
    const ProviderClass = this.providers.get(providerId.toLowerCase());

    if (!ProviderClass) {
      throw new Error(
        `Payment provider '${providerId}' not found. Supported providers: ${this.getSupportedProviders().join(
          ", "
        )}`
      );
    }

    const provider = new ProviderClass();
    await provider.initialize(config);

    return provider;
  }

  /**
   * Get list of all registered provider IDs
   */
  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Register a new payment provider
   */
  registerProvider(
    providerId: string,
    providerClass: new () => PaymentProvider
  ): void {
    this.providers.set(providerId.toLowerCase(), providerClass);
    console.log(`Payment provider '${providerId}' registered successfully`);
  }
}

// Singleton factory instance
export const paymentProviderFactory = new DefaultPaymentProviderFactory();
