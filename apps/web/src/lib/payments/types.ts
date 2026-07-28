export interface CheckoutData {
  companyId: string;
  planName: string;
  billingPeriod: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerName?: string;
  taxId?: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  provider: string;
}

export interface PaymentStatus {
  sessionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentId?: string;
  amount?: number;
  currency?: string;
}

export interface CustomerData {
  email: string;
  name: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface Customer {
  id: string;
  provider: string;
  email: string;
}

export interface InvoiceData {
  customerId: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface PaymentProvider {
  name: string;
  createCheckout(data: CheckoutData): Promise<CheckoutSession>;
  getPaymentStatus(sessionId: string): Promise<PaymentStatus>;
  createCustomer(data: CustomerData): Promise<Customer>;
  getInvoices(customerId: string): Promise<Invoice[]>;
  getInvoicePdfUrl(invoiceId: string): Promise<string | null>;
}
