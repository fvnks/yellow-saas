'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Button } from '@yellow-erp/ui';
import { Plus, Search, Download, Eye, Edit, Trash2, Users, Phone, Mail, MapPin, CreditCard, Building2, Tag, Filter } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getApiClient } from '@/lib/api-client';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taxExemptFilter, setTaxExemptFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomers(),
      api.getCustomerCategories().catch(() => ({ data: [] })),
      api.getCustomerSegments().catch(() => ({ data: [] })),
    ]).then(([res, catRes, segRes]) => {
      setCustomers(res.data || []);
      setCategories(catRes.data || []);
      setSegments(segRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.tax_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.trade_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && c.is_active) || (statusFilter === 'inactive' && !c.is_active);
    const matchesTaxExempt = taxExemptFilter === 'all' || (taxExemptFilter === 'exempt' && c.tax_exempt) || (taxExemptFilter === 'non-exempt' && !c.tax_exempt);
    const matchesCategory = categoryFilter === 'all' || c.category_id === categoryFilter;
    const matchesSegment = segmentFilter === 'all' || c.segment_id === segmentFilter;
    return matchesSearch && matchesStatus && matchesTaxExempt && matchesCategory && matchesSegment;
  });

  const handleExport = useCallback(() => {
    if (filteredCustomers.length === 0) return;
    const headers = ['Nombre', 'Razón Social', 'RUT', 'Email', 'Teléfono', 'Ciudad', 'Región', 'Plazo Días', 'Límite Crédito', 'Exento IVA', 'Activo'];
    const rows = filteredCustomers.map(c => [c.name, c.trade_name || '', c.tax_id || '', c.email || '', c.phone || '', c.city || '', c.region || '', c.payment_terms || 0, c.credit_limit || 0, c.tax_exempt ? 'Sí' : 'No', c.is_active ? 'Sí' : 'No']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredCustomers]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`¿Eliminar cliente "${name}"?`)) return;
    try {
      const api = getApiClient();
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente eliminado');
    } catch {
      toast.error('Error al eliminar cliente');
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de clientes y contacto comercial</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Link href="/dashboard/customers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Clientes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Activos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.filter(c => c.is_active).length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Exentos IVA</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{customers.filter(c => c.tax_exempt).length}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Crédito Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${customers.reduce((sum, c) => sum + (c.credit_limit || 0), 0).toLocaleString('es-CL')}</p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <Filter className="w-4 h-4" />
              Filtros
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar nombre, RUT, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <select value={taxExemptFilter} onChange={(e) => setTaxExemptFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="all">Todos IVA</option>
                <option value="exempt">Exentos</option>
                <option value="non-exempt">No Exentos</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="all">Todas las categorías</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="all">Todos los segmentos</option>
                {segments.map((seg: any) => (
                  <option key={seg.id} value={seg.id}>{seg.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Razón Social</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">RUT</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Plazo</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Crédito</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IVA</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                  <th className="w-12 px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {Array.from({ length: 11 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-500">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-slate-900">{customer.name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{customer.trade_name || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-700">{customer.tax_id || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-700">{customer.city || '—'}</div>
                      <div className="text-[10px] text-slate-500">{customer.region || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-medium text-slate-700">{customer.payment_terms || 0} días</td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-900">${(customer.credit_limit || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${customer.tax_exempt ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {customer.tax_exempt ? 'Exento' : 'Gravado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${customer.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {customer.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {customer.category_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {categories.find((c: any) => c.id === customer.category_id)?.name || '—'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/customers/${customer.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(customer.id, customer.name)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <p>Mostrando {filteredCustomers.length} de {customers.length} clientes</p>
      </div>
    </div>
  );
}
