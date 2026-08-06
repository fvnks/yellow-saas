'use client';

import { useState, useEffect } from 'react';
import { Check, Star, ArrowRight, CreditCard, Zap } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface Plan {
  name: string;
  label: string;
  max_users: number;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

export default function PlanTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data.data || []);

      const api = getApiClient();
      const company = await api.getCompany();
      setCurrentPlan(company?.plan || 'free');
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
    setLoading(false);
  };

  const handleUpgrade = async (planName: string) => {
    setCheckoutLoading(true);
    try {
      const api = getApiClient();
      const res = await fetch(`/api/companies/${api['companyId']}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_name: planName, billing_period: billingPeriod }),
      });
      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
    setCheckoutLoading(false);
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Gratis';
    return `$${(cents / 100).toLocaleString('es-CL')}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tu Plan Actual</h3>
          <p className="text-sm text-slate-500">Plan: <span className="font-medium text-slate-700">{plans.find(p => p.name === currentPlan)?.label || currentPlan}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${billingPeriod === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Anual <span className="text-emerald-600 text-[10px]">-17%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
          const monthlyPrice = billingPeriod === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;

          return (
            <div key={plan.name} className={`relative bg-white border-2 rounded-xl p-6 transition-all ${isCurrent ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  Plan Actual
                </div>
              )}
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold text-slate-900">{plan.label}</h4>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-slate-900">{formatPrice(monthlyPrice)}</span>
                  <span className="text-sm text-slate-500">/mes</span>
                </div>
                {billingPeriod === 'yearly' && plan.price_yearly > 0 && (
                  <p className="text-xs text-slate-400 mt-1">Facturado {formatPrice(plan.price_yearly)}/año</p>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-500 mt-0.5 flex-shrink-0" />
                  {plan.max_users === -1 ? 'Usuarios ilimitados' : `Hasta ${plan.max_users} usuarios`}
                </li>
              </ul>

              {!isCurrent && (
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={checkoutLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {checkoutLoading ? 'Procesando...' : 'Upgrade'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
