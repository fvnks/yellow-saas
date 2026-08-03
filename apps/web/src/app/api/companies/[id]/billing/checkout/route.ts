import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = params.id;
    const body = await request.json();
    const { plan_name, billing_period = 'monthly' } = body;

    if (!plan_name) {
      return errorResponse('plan_name es requerido', 400);
    }

    // Get company info
    const companyResult = await query(
      `SELECT id, name, plan FROM companies WHERE id = $1`,
      [companyId]
    );
    if (companyResult.rows.length === 0) {
      return errorResponse('Empresa no encontrada', 404);
    }
    const company = companyResult.rows[0];

    // Get billing account
    const billingResult = await query(
      `SELECT * FROM billing_accounts WHERE company_id = $1`,
      [companyId]
    );
    const billingAccount = billingResult.rows[0];

    // Get plan details
    const planResult = await query(
      `SELECT * FROM platform_plans WHERE name = $1`,
      [plan_name]
    );
    if (planResult.rows.length === 0) {
      return errorResponse('Plan no encontrado', 404);
    }
    const plan = planResult.rows[0];

    const amount = billing_period === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const providerName = billingAccount?.payment_provider || 'stripe';

    // Create checkout session
    const provider = getPaymentProvider(providerName);
    const session = await provider.createCheckout({
      companyId,
      planName: plan.label || plan.name,
      billingPeriod: billing_period as 'monthly' | 'yearly',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/mi-cuenta?tab=plan&payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/mi-cuenta?tab=plan&payment=cancelled`,
      customerEmail: billingAccount?.billing_email,
      customerName: company.name,
      taxId: billingAccount?.tax_id,
    });

    // Log the payment attempt
    await query(
      `INSERT INTO subscription_payments (company_id, amount, currency, status, payment_provider, provider_session_id, plan_name, billing_period, description)
       VALUES ($1, $2, 'CLP', 'pending', $3, $4, $5, $6, $7)`,
      [companyId, amount, providerName, session.sessionId, plan_name, billing_period, `${plan.label || plan.name} - ${billing_period === 'monthly' ? 'Mensual' : 'Anual'}`]
    );

    return successResponse({
      sessionId: session.sessionId,
      url: session.url,
      provider: providerName,
    });
  } catch (err) {
    console.error('Create checkout error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}
