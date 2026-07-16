'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Button, Input, Select, Badge } from '@yellow-erp/ui';
import { Plus, Search, Eye, CheckCircle, X, RotateCcw, ArrowLeft, Download } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { generateReturnNotePDF } from '@/lib/pdf-design';
import Link from 'next/link';

interface CustomerReturn {
  id: string;
  return_number: string;
  status: string;
  reason: string | null;
  created_at: string;
  customer: { id: string; name: string; tax_id: string } | null;
  warehouse: { id: string; name: string; code: string } | null;
  item_count: number;
}

interface ReturnItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  condition: string;
  reason: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: 'Pendiente', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  completed: { label: 'Completada', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelada', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function SalesReturnsPage() {
  const [returns, setReturns] = useState<CustomerReturn[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sku: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; code: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string; tax_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<CustomerReturn | null>(null);
  const [viewReturnItems, setViewReturnItems] = useState<{ product_id: string; product_name: string; quantity: number; unit_price: number; condition?: string }[]>([]);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [newReturn, setNewReturn] = useState({
    customer_id: '',
    warehouse_id: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = () => {
    const api = getApiClient();
    const params: Record<string, string> = { limit: '200' };
    if (search) params.search = search;
    if (statusFilter !== 'all') params.status = statusFilter;
    api.getCustomerReturns(params)
      .then((res) => setReturns(res.data || []))
      .catch(() => setReturns([]));
  };

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getCustomerReturns({ limit: '200' }),
      api.getProducts({ limit: '500' }),
      api.getWarehouses({ limit: '100' }),
      api.getCustomers({ limit: '500' }),
      api.getCompany().catch(() => null),
    ])
      .then(([returnsRes, productsRes, warehousesRes, customersRes, companyRes]) => {
        setReturns(returnsRes.data || []);
        setProducts((productsRes.data || []).map((p: any) => ({ id: p.id, name: p.name, sku: p.sku })));
        setWarehouses((warehousesRes.data || []).map((w: any) => ({ id: w.id, name: w.name, code: w.code })));
        setCustomers((customersRes.data || []).map((c: any) => ({ id: c.id, name: c.name, tax_id: c.tax_id })));
        if (companyRes) setCompany(companyRes);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [search, statusFilter]);

  const filteredReturns = returns.filter((r) => {
    const matchesSearch =
      r.return_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewReturn = async (ret: CustomerReturn) => {
    setSelectedReturn(ret);
    setShowDetailModal(true);
    try {
      const api = getApiClient();
      const detail = await api.getCustomerReturn(ret.id);
      if (detail?.items?.length) {
        setViewReturnItems(detail.items.map((i: any) => ({
          product_id: i.product_id,
          product_name: i.product?.name || i.product_name || '---',
          quantity: i.quantity,
          unit_price: i.unit_price,
          condition: i.condition,
        })));
      } else {
        setViewReturnItems([]);
      }
    } catch {
      setViewReturnItems([]);
    }
  };

  const handleCompleteReturn = async (id: string) => {
    const api = getApiClient();
    await api.completeCustomerReturn(id);
    setShowDetailModal(false);
    setSelectedReturn(null);
    fetchReturns();
  };

  const addReturnItem = () => {
    setReturnItems((prev) => [
      ...prev,
      { product_id: '', product_name: '', quantity: 1, unit_price: 0, condition: 'good', reason: '' },
    ]);
  };

  const updateReturnItem = (index: number, field: keyof ReturnItem, value: string | number) => {
    setReturnItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeReturnItem = (index: number) => {
    setReturnItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = async () => {
    setSubmitting(true);
    try {
      const api = getApiClient();
      await api.createCustomerReturn({
        customer_id: newReturn.customer_id,
        warehouse_id: newReturn.warehouse_id,
        reason: newReturn.reason,
        items: returnItems.filter((i) => i.product_id).map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          condition: i.condition,
          reason: i.reason,
        })),
      });
      setShowNewModal(false);
      setNewReturn({ customer_id: '', warehouse_id: '', reason: '' });
      setReturnItems([]);
      fetchReturns();
    } catch (err) {
      console.error('Error creating return:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/sales"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">Devoluciones de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Gestionar devoluciones de mercadería</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Devolución
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por número o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-52 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Nº Devolución
                </th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Bodega
                </th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-8 mx-auto animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded-full w-20 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-8 ml-auto animate-pulse" /></td>
                  </tr>
                ))
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <RotateCcw className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No se encontraron devoluciones</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => {
                  const status = statusConfig[ret.status] || statusConfig.pending;
                  return (
                    <tr key={ret.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-medium text-slate-900">{ret.return_number}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{ret.customer?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{ret.warehouse?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 text-center">{ret.item_count}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {ret.created_at ? new Date(ret.created_at).toLocaleDateString('es-CL') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${status.bg} ${status.text} border ${status.border}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewReturn(ret)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Detalle de Devolución</h2>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedReturn(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Nº Devolución</p>
                  <p className="text-sm font-mono font-medium text-slate-900 mt-1">{selectedReturn.return_number}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusConfig[selectedReturn.status]?.bg || statusConfig.pending.bg} ${statusConfig[selectedReturn.status]?.text || statusConfig.pending.text} border ${statusConfig[selectedReturn.status]?.border || statusConfig.pending.border}`}
                    >
                      {statusConfig[selectedReturn.status]?.label || selectedReturn.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</p>
                  <p className="text-sm text-slate-900 mt-1">{selectedReturn.customer?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</p>
                  <p className="text-sm text-slate-900 mt-1">{selectedReturn.warehouse?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {selectedReturn.created_at ? new Date(selectedReturn.created_at).toLocaleDateString('es-CL') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Items</p>
                  <p className="text-sm text-slate-900 mt-1">{selectedReturn.item_count}</p>
                </div>
              </div>
              {selectedReturn.reason && (
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Motivo</p>
                  <p className="text-sm text-slate-700 mt-1">{selectedReturn.reason}</p>
                </div>
              )}
              {viewReturnItems.length > 0 && (
                <div>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Items Devueltos</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-2 py-1 text-[9px] font-semibold text-slate-500 uppercase">Producto</th>
                        <th className="text-center px-2 py-1 text-[9px] font-semibold text-slate-500 uppercase">Cant.</th>
                        <th className="text-right px-2 py-1 text-[9px] font-semibold text-slate-500 uppercase">P. Unit.</th>
                        <th className="text-right px-2 py-1 text-[9px] font-semibold text-slate-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewReturnItems.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-2 py-1 text-slate-700">{item.product_name}</td>
                          <td className="px-2 py-1 text-center text-slate-700">{item.quantity}</td>
                          <td className="px-2 py-1 text-right text-slate-700">${item.unit_price.toLocaleString('es-CL')}</td>
                          <td className="px-2 py-1 text-right text-slate-700 font-medium">${(item.quantity * item.unit_price).toLocaleString('es-CL')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowDetailModal(false); setSelectedReturn(null); }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={async () => {
                  if (!selectedReturn) return;
                  const c = company || {};
                  const doc = await generateReturnNotePDF({
                    id: selectedReturn.id,
                    number: selectedReturn.return_number,
                    date: selectedReturn.created_at?.split('T')[0] || '',
                    company: {
                      name: c.name || 'Empresa', tax_id: c.tax_id || undefined, razon_social: c.razon_social || undefined,
                      giro: c.giro || undefined, address: c.address || undefined, city: c.city || undefined,
                      region: c.region || undefined, phone: c.phone || undefined, email: c.email || undefined,
                      logo_url: c.logo_url || undefined,
                    },
                    customer: selectedReturn.customer ? { name: selectedReturn.customer.name, tax_id: selectedReturn.customer.tax_id } : undefined,
                    items: viewReturnItems.map(item => ({
                      name: item.product_name,
                      sku: '',
                      quantity: item.quantity,
                      unit_price: item.unit_price,
                      total: item.quantity * item.unit_price,
                    })),
                    reason: selectedReturn.reason || undefined,
                    condition: viewReturnItems[0]?.condition || undefined,
                  });
                  doc.save(`${selectedReturn.return_number}.pdf`);
                }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              {selectedReturn.status === 'pending' && (
                <button
                  onClick={() => handleCompleteReturn(selectedReturn.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Completar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-900">Nueva Devolución</h2>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewReturn({ customer_id: '', warehouse_id: '', reason: '' });
                  setReturnItems([]);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Cliente</label>
                  <select
                    value={newReturn.customer_id}
                    onChange={(e) => setNewReturn((prev) => ({ ...prev, customer_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.tax_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Bodega</label>
                  <select
                    value={newReturn.warehouse_id}
                    onChange={(e) => setNewReturn((prev) => ({ ...prev, warehouse_id: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar bodega...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Motivo de la Devolución</label>
                <textarea
                  value={newReturn.reason}
                  onChange={(e) => setNewReturn((prev) => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describir el motivo de la devolución..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Productos a Devolver</h3>
                  <button
                    type="button"
                    onClick={addReturnItem}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    + Agregar producto
                  </button>
                </div>
                <div className="space-y-3">
                  {returnItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                      <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No hay productos agregados</p>
                      <p className="text-xs text-slate-400 mt-1">Haz clic en &quot;Agregar producto&quot; para comenzar</p>
                    </div>
                  ) : (
                    returnItems.map((item, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Item {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeReturnItem(index)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">Producto</label>
                            <select
                              value={item.product_id}
                              onChange={(e) => {
                                const product = products.find((p) => p.id === e.target.value);
                                updateReturnItem(index, 'product_id', e.target.value);
                                if (product) updateReturnItem(index, 'product_name', product.name);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="">Seleccionar...</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">Condición</label>
                            <select
                              value={item.condition}
                              onChange={(e) => updateReturnItem(index, 'condition', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option value="good">Buen estado</option>
                              <option value="damaged">Dañado</option>
                              <option value="defective">Defectuoso</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateReturnItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">Precio Unitario</label>
                            <input
                              type="number"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) => updateReturnItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-700">Motivo del Item</label>
                          <input
                            type="text"
                            value={item.reason}
                            onChange={(e) => updateReturnItem(index, 'reason', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Motivo específico del producto..."
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewReturn({ customer_id: '', warehouse_id: '', reason: '' });
                  setReturnItems([]);
                }}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={submitting || !newReturn.customer_id || !newReturn.warehouse_id || returnItems.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                {submitting ? 'Creando...' : 'Crear Devolución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
