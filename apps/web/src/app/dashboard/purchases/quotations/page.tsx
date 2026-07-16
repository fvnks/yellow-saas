'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Search, Eye, Trash2, FileText, Calendar, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface Quotation {
  id: string;
  number: string;
  supplier: string;
  date: string;
  expiryDate: string;
  total: number;
  items: number;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  accepted: { label: 'Aceptada', variant: 'success' },
  rejected: { label: 'Rechazada', variant: 'danger' },
  expired: { label: 'Vencida', variant: 'neutral' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
};

export default function PurchasesQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const api = getApiClient();
    api.getQuotations()
      .then(res => {
        const mapped = (res.data || []).map((q: any) => ({
          id: q.id,
          number: q.number,
          supplier: q.supplier?.name || q.supplier_id || '',
          date: q.quote_date?.split('T')[0] || '',
          expiryDate: q.expiry_date?.split('T')[0] || '',
          total: q.total_amount,
          items: Array.isArray((q as any).items) ? (q as any).items.length : ((q as any).items_count || 0),
          status: q.status,
        }));
        setQuotations(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = quotations.filter(q => {
    const matchesSearch = q.number.toLowerCase().includes(search.toLowerCase()) || q.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cotización?')) return;
    const api = getApiClient();
    await api.deleteQuotation(id);
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  const getBadge = (status: string) => statusConfig[status] || { label: status, variant: 'neutral' as const };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cotizaciones de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de cotizaciones con proveedores</p>
        </div>
        <Link href="/dashboard/purchases/quotations/new">
          <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Cotización
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por N° cotización, proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
          <Select
            placeholder="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'accepted', label: 'Aceptada' },
              { value: 'rejected', label: 'Rechazada' },
              { value: 'expired', label: 'Vencida' },
            ]}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay cotizaciones</h3>
          <p className="text-sm text-slate-500 mb-4">Crea una nueva cotización para comenzar</p>
          <Link href="/dashboard/purchases/quotations/new">
            <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2 inline" />
              Nueva Cotización
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Cotización</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Fecha Vencimiento</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((quote) => {
                  const cfg = getBadge(quote.status);
                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-mono text-slate-900">{quote.number}</TableCell>
                      <TableCell>{quote.supplier}</TableCell>
                      <TableCell>{quote.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {quote.expiryDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{quote.items}</TableCell>
                      <TableCell className="text-right font-medium">${quote.total.toLocaleString('es-CL')}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/dashboard/purchases/quotations/${quote.id}`}>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button onClick={() => handleDelete(quote.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <p>Mostrando 1 a {filtered.length} de {quotations.length} Cotizaciones</p>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed">Anterior</button>
            <button disabled className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
