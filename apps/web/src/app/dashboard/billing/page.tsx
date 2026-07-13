'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, KPICard } from '@yellow-erp/ui';
import { CreditCard, Plus, Search, FileText, Send, CheckCircle2, Clock, AlertCircle, Download, Eye, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../lib/api-client';

interface Invoice {
  id: string;
  client: string;
  rut: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  items: number;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  sent: { label: 'Enviada', variant: 'info' },
  paid: { label: 'Pagada', variant: 'success' },
  overdue: { label: 'Vencida', variant: 'danger' },
  partial: { label: 'Pago Parcial', variant: 'warning' },
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getInvoices().then(res => {
      const items = (res.data || []).map((inv: any) => ({
        id: inv.id || inv.invoice_number,
        client: inv.client_name || inv.customer_name || inv.client || '',
        rut: inv.client_rut || inv.rut || '',
        date: inv.issue_date || inv.date || '',
        dueDate: inv.due_date || inv.dueDate || '',
        amount: inv.total || inv.amount || 0,
        status: inv.status || 'draft',
        items: inv.item_count || inv.items || 0,
      }));
      setInvoices(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.rut.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const pendingAmount = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Facturación</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de facturas y cobranzas</p>
        </div>
        <Link href="/dashboard/billing/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Facturado Total" value={`$${(totalInvoiced/1000000).toFixed(1)}M`} icon={CreditCard} trend={`${invoices.length} facturas`} trendUp={true} />
        <KPICard label="Cobrado" value={`$${(paidInvoices.reduce((s,i)=>s+i.amount,0)/1000000).toFixed(1)}M`} icon={CheckCircle2} trend={`${paidInvoices.length} facturas`} trendUp={true} />
        <KPICard label="Por Cobrar" value={`$${(pendingAmount/1000000).toFixed(1)}M`} icon={Clock} trend="Pendiente" trendUp={false} />
        <KPICard label="Vencidas" value={overdueInvoices.length} icon={AlertCircle} trend={overdueInvoices.length > 0 ? "Requiere atención" : "Sin vencidas"} trendUp={overdueInvoices.length === 0} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Buscar por ID, cliente o RUT..."
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'draft', label: 'Borrador' },
              { value: 'sent', label: 'Enviada' },
              { value: 'paid', label: 'Pagada' },
              { value: 'overdue', label: 'Vencida' },
            ]}
          />
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las fechas' },
              { value: 'today', label: 'Hoy' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
            ]}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">ID Factura</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Emisión</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Vencimiento</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{invoice.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{invoice.client}</p>
                    <p className="text-xs text-slate-500">{invoice.rut}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{invoice.date}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{invoice.dueDate}</td>
                  <td className="px-4 py-3 text-xs text-slate-700 text-center">{invoice.items}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">${invoice.amount.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusConfig[invoice.status]?.variant || 'neutral'}>
                      {statusConfig[invoice.status]?.label || invoice.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="secondary" size="sm"><Eye className="w-4 h-4" /></Button>
                      <Button variant="secondary" size="sm"><Download className="w-4 h-4" /></Button>
                      {invoice.status === 'draft' && (
                        <Button variant="secondary" size="sm"><Send className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron facturas</p>
        </div>
      )}
    </div>
  );
}

