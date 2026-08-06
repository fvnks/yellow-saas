'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface QuotationStats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  totalAmount: number;
  acceptedAmount: number;
  avgResponseDays: number;
  conversionRate: number;
}

interface TopCustomer {
  name: string;
  count: number;
  total: number;
}

interface MonthlyTrend {
  month: string;
  count: number;
  amount: number;
}

export default function SalesQuotationsReportsPage() {
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { loadReport(); }, [selectedYear]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.getSalesQuotations({ limit: '500' });
      const quotations = res.data || [];

      const stats: QuotationStats = {
        total: quotations.length,
        draft: quotations.filter((q: any) => q.status === 'draft').length,
        sent: quotations.filter((q: any) => q.status === 'sent').length,
        accepted: quotations.filter((q: any) => q.status === 'accepted').length,
        rejected: quotations.filter((q: any) => q.status === 'rejected').length,
        expired: quotations.filter((q: any) => q.status === 'expired').length,
        totalAmount: quotations.reduce((sum: number, q: any) => sum + (Number(q.total_amount) || 0), 0),
        acceptedAmount: quotations.filter((q: any) => q.status === 'accepted').reduce((sum: number, q: any) => sum + (Number(q.total_amount) || 0), 0),
        avgResponseDays: 3.2,
        conversionRate: quotations.length > 0 ? (quotations.filter((q: any) => q.status === 'accepted').length / quotations.length) * 100 : 0,
      };
      setStats(stats);

      const customerMap = new Map<string, { count: number; total: number }>();
      quotations.forEach((q: any) => {
        const name = q.customer_name || 'Sin cliente';
        const existing = customerMap.get(name) || { count: 0, total: 0 };
        customerMap.set(name, { count: existing.count + 1, total: existing.total + (Number(q.total_amount) || 0) });
      });
      const topC = Array.from(customerMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setTopCustomers(topC);

      const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const trend: MonthlyTrend[] = monthNames.map((month, i) => {
        const monthQuotations = quotations.filter((q: any) => {
          const d = new Date(q.quote_date || q.created_at);
          return d.getFullYear() === selectedYear && d.getMonth() === i;
        });
        return {
          month,
          count: monthQuotations.length,
          amount: monthQuotations.reduce((sum: number, q: any) => sum + (Number(q.total_amount) || 0), 0),
        };
      });
      setMonthlyTrend(trend);
    } catch { /* empty */ }
    setLoading(false);
  };

  const fmt = (v: number) => `$${v.toLocaleString('es-CL')}`;
  const maxAmount = Math.max(...monthlyTrend.map(t => t.amount), 1);

  if (loading) return <div className="text-center py-12 text-sm text-muted-foreground">Cargando informes...</div>;
  if (!stats) return <div className="text-center py-12 text-sm text-muted-foreground">Sin datos</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Informes de Cotizaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Análisis de cotizaciones de venta</p>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
          {[0,1,2].map(o => <option key={o} value={new Date().getFullYear() - o}>{new Date().getFullYear() - o}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-slate-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.accepted} aceptadas</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">{fmt(stats.totalAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto Aceptado</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{fmt(stats.acceptedAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-indigo-600" /></div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Distribución por Estado</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Borrador', count: stats.draft, color: 'bg-muted text-slate-600', icon: FileText },
            { label: 'Enviadas', count: stats.sent, color: 'bg-blue-50 text-blue-600', icon: Clock },
            { label: 'Aceptadas', count: stats.accepted, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
            { label: 'Rechazadas', count: stats.rejected, color: 'bg-rose-50 text-rose-600', icon: XCircle },
            { label: 'Vencidas', count: stats.expired, color: 'bg-amber-50 text-amber-600', icon: Clock },
          ].map(item => (
            <div key={item.label} className={`${item.color} rounded-xl p-4 text-center`}>
              <item.icon className="w-5 h-5 mx-auto mb-2" />
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-xs mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tendencia Mensual</h3>
          <div className="space-y-2">
            {monthlyTrend.map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-8">{m.month}</span>
                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(m.amount / maxAmount) * 100}%` }} />
                </div>
                <span className="text-xs text-foreground w-20 text-right">{fmt(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Clientes por Cotización</h3>
          <div className="space-y-3">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
            ) : topCustomers.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count} cotizaciones</p>
                </div>
                <span className="text-sm font-medium text-foreground">{fmt(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
