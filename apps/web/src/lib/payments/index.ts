import { PaymentProvider } from './types';
import { StripeProvider } from './stripe';
import { MachProvider } from './mach'; const providers: Record<string, () => PaymentProvider> = { stripe: () => new StripeProvider(), mach: () => new MachProvider(),
}; export function getPaymentProvider(name: string): PaymentProvider { const factory = providers[name]; if (!factory) { throw new Error(`Payment provider "${name}" is not supported. Available: ${Object.keys(providers).join(', ')}`); } return factory();
} export function getAvailableProviders(): string[] { return Object.keys(providers);
} export type { PaymentProvider, CheckoutData, CheckoutSession, PaymentStatus, CustomerData, Customer, Invoice } from './types';
