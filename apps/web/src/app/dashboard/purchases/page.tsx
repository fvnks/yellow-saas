'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Trash2, Calendar, Truck, ShoppingCart, FileText, Building2, Package, ReceiptText, RotateCcw, FileMinus, AlertTriangle, DollarSign, TrendingUp, BarChart3, Target, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';

import PurchaseInvoices from './components/PurchaseInvoices';
import PurchaseReturns from './components/PurchaseReturns';
import PurchaseCreditNotes from './components/PurchaseCreditNotes';
import PurchaseDebitNotes from './components/PurchaseDebitNotes';
import SupplierStatement from './components/SupplierStatement';
import SupplierCreditControl from './components/SupplierCreditControl';
import PurchaseDashboard from './components/PurchaseDashboard';
import PurchaseReports from './components/PurchaseReports';
import SupplierPriceHistory from './components/SupplierPriceHistory';
import SupplierContracts from './components/SupplierContracts';
import PurchaseBudgets from './components/PurchaseBudgets';
import PurchaseForecast from './components/PurchaseForecast';

const purchaseModules = [
  { id: 'compras', label: 'Compras', icon: ShoppingCart, tabs: [
    { id: 'orders', label: 'OC' }, { id: 'receipts', label: 'Recepciones' }, { id: 'quotations', label: 'Cotizaciones' },
    { id: 'register', label: 'Registro' }, { id: 'invoices', label: 'Facturas' }, { id: 'returns', label: 'Devoluciones' },
  ]},
  { id: 'documentos', label: 'Documentos', icon: FileText, tabs: [
    { id: 'credit-notes', label: 'NC' }, { id: 'debit-notes', label: 'ND' },
  ]},
  { id: 'finanzas', label: 'Finanzas', icon: DollarSign, tabs: [
    { id: 'credit-control', label: 'Cr�dito' }, { id: 'statement', label: 'Estado Cta.' },
  ]},
  { id: 'analisis', label: 'An�lisis', icon: BarChart3, tabs: [
    { id: 'dashboard', label: 'Dashboard' }, { id: 'reports', label: 'Reportes' },
    { id: 'price-history', label: 'Hist. Precios' }, { id: 'contracts', label: 'Contratos' },
    { id: 'budgets', label: 'Presupuestos' }, { id: 'forecast', label: 'Pron�stico' },
  ]},
];

type TabId = 'orders' | 'receipts' | 'quotations' | 'register' | 'invoices' | 'returns' | 'credit-notes' | 'debit-notes' | 'statement' | 'credit-control' | 'dashboard' | 'reports' | 'price-history' | 'contracts' | 'budgets' | 'forecast';

const allTabs: TabId[] = ['orders','receipts','quotations','register','invoices','returns','credit-notes','debit-notes','statement','credit-control','dashboard','reports','price-history','contracts','budgets','forecast'];

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
  const [activeTab, setActiveTab] = useState<TabId>('orders');
  const [activeModule, setActiveModule] = useState(() => {
    for (const m of purchaseModules) {
      if (m.tabs.some(t => t.id === 'orders')) return m.id;
    }
    return 'compras';
  });

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
        project: o.project?.name || '',
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
    if (!confirm('�Eliminar esta orden de compra?')) return;
    const api = getApiClient();
    await api.deletePurchaseOrder(id);
    setPurchaseOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compras</h1>
          <p className="text-sm text-slate-500 mt-1">Gesti�n de compras, facturas y proveedores</p>
        </div>
        <Link href="/dashboard/purchases/new">
          <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nueva Orden
          </button>
        </Link>
      </div>

      {/* Module Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-1 flex-wrap">
          {purchaseModules.map(m => {
            const isActive = activeModule === m.id;
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => {
                setActiveModule(m.id);
                const firstTab = m.tabs[0];
                if (firstTab) { setActiveTab(firstTab.id as TabId); setSearch(''); setStatusFilter('all'); setPage(1); }
              }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="w-4 h-4" /> {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tabs for active module */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-1 flex-wrap">
          {purchaseModules.find(m => m.id === activeModule)?.tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id as TabId); setSearch(''); setStatusFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Link href="/dashboard/purchases/new">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-emerald-600" /></div>
                    <span className="text-sm font-medium text-slate-700 text-center">Nueva Orden</span>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/purchases/quotations/new">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-indigo-600" /></div>
                    <span className="text-sm font-medium text-slate-700 text-center">Nueva Cotizaci�n</span>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/suppliers/new">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-600" /></div>
                    <span className="text-sm font-medium text-slate-700 text-center">Nuevo Proveedor</span>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/purchases/receipts/new">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-amber-600" /></div>
                    <span className="text-sm font-medium text-slate-700 text-center">Recepci�n</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="search" placeholder="Buscar por N� orden, proveedor..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="all">Todos</option>
                  <option value="draft">Borrador</option><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option>
                  <option value="partial">Parcial</option><option value="received">Recibida</option><option value="cancelled">Cancelada</option>
                </select>
                <select value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setPage(1); }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="all">Todos</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 dark:bg-slate-900 dark:border-slate-800">
                <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 dark:bg-slate-900 dark:border-slate-800 text-center">
                <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No hay �rdenes de compra</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">N� Orden</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Proveedor</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
                        <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Entrega</th>
                        <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Total</th>
                        <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Estado</th>
                        <th className="w-12 px-4 py-3"></th>
                      </tr></thead>
                      <tbody>
                        {paginated.map((order) => {
                          const cfg = orderStatusConfig[order.status] || { label: order.status, variant: 'neutral' as const };
                          return (
                            <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-xs font-medium text-slate-900">{order.number}</td>
                              <td className="px-4 py-3"><p className="text-xs font-medium text-slate-900">{order.supplier}</p><p className="text-[9px] text-slate-500">{order.supplierCode}</p></td>
                              <td className="px-4 py-3 text-xs text-slate-600">{order.date}</td>
                              <td className="px-4 py-3 text-xs text-slate-600">{order.expectedDate}</td>
                              <td className="px-4 py-3 text-xs text-right font-medium text-slate-900">${order.total.toLocaleString('es-CL')}</td>
                              <td className="px-4 py-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.variant === 'success' ? 'bg-emerald-50 text-emerald-700' : cfg.variant === 'warning' ? 'bg-amber-50 text-amber-700' : cfg.variant === 'danger' ? 'bg-red-50 text-red-700' : cfg.variant === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{cfg.label}</span></td>
                              <td className="px-4 py-3 text-center">
                                <Link href={`/dashboard/purchases/${order.id}`} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors inline-flex"><Eye className="w-4 h-4" /></Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-4">
                  <p>Mostrando {(page - 1) * ITEMS_PER_PAGE + 1} a {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors">Anterior</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors">Siguiente</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'receipts' && (
          <div className="p-6 text-center">
            <Link href="/dashboard/purchases/receipts"><button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Ver Recepciones</button></Link>
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="p-6 text-center">
            <Link href="/dashboard/purchases/quotations"><button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Ver Cotizaciones</button></Link>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="p-6 text-center">
            <Link href="/dashboard/purchases/register"><button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Ver Registro</button></Link>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="p-6"><PurchaseInvoices /></div>
        )}

        {activeTab === 'returns' && (
          <div className="p-6"><PurchaseReturns /></div>
        )}

        {activeTab === 'credit-notes' && (
          <div className="p-6"><PurchaseCreditNotes /></div>
        )}

        {activeTab === 'debit-notes' && (
          <div className="p-6"><PurchaseDebitNotes /></div>
        )}

        {activeTab === 'statement' && (
          <div className="p-6"><SupplierStatement /></div>
        )}

        {activeTab === 'credit-control' && (
          <div className="p-6"><SupplierCreditControl /></div>
        )}

        {activeTab === 'dashboard' && (
          <div className="p-6"><PurchaseDashboard /></div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6"><PurchaseReports /></div>
        )}

        {activeTab === 'price-history' && (
          <div className="p-6"><SupplierPriceHistory /></div>
        )}

        {activeTab === 'contracts' && (
          <div className="p-6"><SupplierContracts /></div>
        )}

        {activeTab === 'budgets' && (
          <div className="p-6"><PurchaseBudgets /></div>
        )}

        {activeTab === 'forecast' && (
          <div className="p-6"><PurchaseForecast /></div>
        )}
    </div>
  );
}
