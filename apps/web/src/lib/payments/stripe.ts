import {
  PaymentProvider,
  CheckoutData,
  CheckoutSession,
  PaymentStatus,
  CustomerData,
  Customer,
  Invoice,
} from './types';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

async function stripeRequest(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${STRIPE_API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Stripe API error: ${response.status}`);
  }
  return response.json();
}

function toFormData(data: Record<string, any>, prefix = ''): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = toFormData(value, fullKey);
        nested.forEach((v, k) => params.set(k, v));
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === 'object') {
            const nested = toFormData(item, `${fullKey}[${i}]`);
            nested.forEach((v, k) => params.set(k, v));
          } else {
            params.set(`${fullKey}[${i}]`, String(item));
          }
        });
      } else {
        params.set(fullKey, String(value));
      }
    }
  }
  return params;
}

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async createCheckout(data: CheckoutData): Promise<CheckoutSession> {
    const priceData = {
      currency: 'clp',
      product_data: {
        name: `Yellow ERP - ${data.planName} (${data.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'})`,
      },
      unit_amount: 0, // Will be set by price lookup or metadata
      recurring: {
        interval: data.billingPeriod === 'monthly' ? 'month' : 'year',
      },
    };

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('success_url', data.successUrl);
    params.set('cancel_url', data.cancelUrl);
    params.set('customer_email', data.customerEmail || '');
    params.set('metadata[company_id]', data.companyId);
    params.set('metadata[plan_name]', data.planName);
    params.set('metadata[billing_period]', data.billingPeriod);
    params.set('subscription_data[metadata][company_id]', data.companyId);
    params.set('subscription_data[metadata][plan_name]', data.planName);

    // Line item
    params.set('line_items[0][price_data][currency]', 'clp');
    params.set('line_items[0][price_data][product_data][name]', `Yellow ERP - ${data.planName}`);
    params.set('line_items[0][price_data][recurring][interval]', data.billingPeriod === 'monthly' ? 'month' : 'year');
    params.set('line_items[0][quantity]', '1');

    const session = await stripeRequest('/checkout/sessions', {
      method: 'POST',
      body: params.toString(),
    });

    return {
      sessionId: session.id,
      url: session.url,
      provider: 'stripe',
    };
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const session = await stripeRequest(`/checkout/sessions/${sessionId}`);
    return {
      sessionId: session.id,
      status: session.payment_status === 'paid' ? 'completed' : session.status === 'expired' ? 'cancelled' : 'pending',
      amount: session.amount_total,
      currency: session.currency,
    };
  }

  async createCustomer(data: CustomerData): Promise<Customer> {
    const params = new URLSearchParams();
    params.set('email', data.email);
    params.set('name', data.name);
    if (data.taxId) params.set('tax_id_data[0][type]', 'cl_rut');
    if (data.taxId) params.set('tax_id_data[0][value]', data.taxId);
    if (data.address) params.set('address[line1]', data.address);
    if (data.city) params.set('address[city]', data.city);
    if (data.country) params.set('address[country]', data.country || 'CL');

    const customer = await stripeRequest('/customers', {
      method: 'POST',
      body: params.toString(),
    });

    return {
      id: customer.id,
      provider: 'stripe',
      email: customer.email,
    };
  }

  async getInvoices(customerId: string): Promise<Invoice[]> {
    const result = await stripeRequest(`/invoices?customer=${customerId}&limit=50`);
    return (result.data || []).map((inv: any) => ({
      id: inv.id,
      number: inv.number || inv.id,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status === 'paid' ? 'paid' : inv.status === 'open' ? 'pending' : 'overdue',
      pdfUrl: inv.invoice_pdf,
      createdAt: new Date(inv.created * 1000).toISOString(),
    }));
  }

  async getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
    const inv = await stripeRequest(`/invoices/${invoiceId}`);
    return inv.invoice_pdf || null;
  }
}
