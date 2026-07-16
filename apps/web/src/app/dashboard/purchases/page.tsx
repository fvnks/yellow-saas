'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Select } from '@yellow-erp/ui';
import { Plus, Search, Eye, Trash2, Calendar, Truck, ShoppingCart, FileText, Building2, Package, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

const ITEMS_PER_PAGE = 10;

const orderStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  draft: { label: 'Borrador', variant: 'neutral' },
  pending: { label: 'Pendiente', variant: 'warning' },
  confirmed: { label: 'Confirmada', variant: 'info' },
  partial: { label: 'Parcial', variant: 'info' },
  received: { label: 'Recibida', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
};

export default function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getPurchaseOrders().catch(() => ({ data: [] })),
      api.getSuppliers().catch(() => ({ data: [] })),
    ]).then(([ordersRes, suppliersRes]) => {
      setPurchaseOrders((ordersRes.data || []).map((o: any) => ({
        id: o.id,
        number: o.order_number || o.number || '',
        supplier: o.supplier?.name || o.supplier_id || '',
        supplierId: o.supplier_id,
        supplierCode: o.supplier?.tax_id || '',
        date: o.order_date?.split('T')[0] || o.created_at?.split('T')[0] || '',
        expectedDate: o.expected_date?.split('T')[0] || '',
        total: o.total || o.total_amount || 0,
        status: o.status,
        warehouse: o.warehouse?.name || '',
        items: Array.isArray(o.items) ? o.items.length : 0,
      })));
      setSuppliers((suppliersRes.data || []).map((s: any) => ({ id: s.id, name: s.name })));
      setLoading(false);
    });
  }, []);

  const filtered = purchaseOrders.filter(o => {
    const matchesSearch = o.number.toLowerCase().includes(search.toLowerCase()) || o.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || o.supplierId === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta orden de compra?')) return;
    const api = getApiClient();
    await api.deletePurchaseOrder(id);
    setPurchaseOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Órdenes de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de órdenes de compra y recepciones</p>
        </div>
        <Link href="/dashboard/purchases/new">
          <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Orden
          </button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/dashboard/purchases/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Nueva Orden</span>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/purchases/quotations/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Nueva Cotización</span>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/purchases/suppliers/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Nuevo Proveedor</span>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/purchases/receipts/new">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-700 text-center">Recepción</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por N° orden, proveedor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
          <Select
            placeholder="Estado"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'draft', label: 'Borrador' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'confirmed', label: 'Confirmada' },
              { value: 'partial', label: 'Parcial' },
              { value: 'received', label: 'Recibida' },
              { value: 'cancelled', label: 'Cancelada' },
            ]}
            className="w-full sm:w-40"
          />
          <Select
            placeholder="Proveedor"
            value={supplierFilter}
            onChange={(e) => { setSupplierFilter(e.target.value); setPage(1); }}
            options={[
              { value: 'all', label: 'Todos' },
              ...suppliers.map((s: any) => ({ value: s.id, label: s.name })),
            ]}
            className="w-full sm:w-48"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay órdenes de compra</h3>
          <p className="text-sm text-slate-500 mb-4">Crea una nueva orden para comenzar</p>
          <Link href="/dashboard/purchases/new">
            <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2 inline" />
              Nueva Orden
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° orden</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Almacén</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((order) => {
                    const cfg = orderStatusConfig[order.status] || { label: order.status, variant: 'neutral' as const };
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-slate-900">{order.number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{order.supplier}</p>
                            <p className="text-xs text-slate-500">{order.supplierCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {order.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-slate-400" />
                            {order.expectedDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{order.warehouse}</TableCell>
                        <TableCell className="text-center font-medium">{order.items}</TableCell>
                        <TableCell className="text-right font-medium">${order.total.toLocaleString('es-CL')}</TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/dashboard/purchases/${order.id}`}>
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" aria-label="Ver">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button onClick={() => handleDelete(order.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" aria-label="Eliminar">
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

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} Órdenes</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
