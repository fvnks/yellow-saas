'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, XCircle, Clock } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { NotificationAlert } from '@/components/ui/notification-alert';

interface Reservation {
  id: string; quantity: number; status: string; reference_type: string | null;
  reference_id: string | null; expires_at: string | null; notes: string | null;
  product: { id: string; name: string; sku: string };
  warehouse: { id: string; name: string; code: string };
  created_at: string;
}

const statusMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
  active: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Activa' },
  released: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Liberada' },
  fulfilled: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Cumplida' },
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', quantity: '', reference_type: 'manual', notes: '', expires_at: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadReservations(); loadOptions(); }, [search]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params: Record<string, string> = { limit: '100' };
      if (search) params.search = search;
      const res = await api.getStockReservations(params);
      setReservations(res.data || []);
    } catch (e) { console.error(e); setError('No se pudieron cargar las reservas'); }
    setLoading(false);
  };

  const loadOptions = async () => {
    try {
      const api = getApiClient();
      const [pRes, wRes] = await Promise.all([
        api.getProducts({ limit: '200' }),
        api.getWarehouses({ limit: '100' }),
      ]);
      setProducts(pRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (e) { console.error(e); setError('No se pudieron cargar las opciones'); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.warehouse_id || !form.quantity) return;
    try {
      const api = getApiClient();
      await api.createStockReservation({
        product_id: form.product_id, warehouse_id: form.warehouse_id,
        quantity: Number(form.quantity), reference_type: form.reference_type as any,
        notes: form.notes || undefined, expires_at: form.expires_at || undefined,
      });
      setShowNew(false);
      setForm({ product_id: '', warehouse_id: '', quantity: '', reference_type: 'manual', notes: '', expires_at: '' });
      loadReservations();
    } catch (e) { console.error(e); setError('No se pudo crear la reserva'); }
  };

  const handleRelease = async (id: string) => {
    if (!confirm('Liberar esta reserva?')) return;
    try { await getApiClient().releaseStockReservation(id); loadReservations(); } catch (e) { console.error(e); setError('No se pudo liberar la reserva'); }
  };

  const filtered = reservations.filter(r =>
    r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.product?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reservas de Stock</h1>
            <p className="text-sm text-slate-500 mt-1">Reservar stock para ordenes</p>
          </div>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Reserva
        </button>
      </div>

      {error && <NotificationAlert variant="warning" title={error} dismissible onDismiss={() => setError('')} />}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar producto, SKU..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
      </div>

      {showNew && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Nueva Reserva</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Producto *</label>
              <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Bodega *</label>
              <select value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Seleccionar...</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Cantidad *</label>
              <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Tipo Referencia</label>
              <select value={form.reference_type} onChange={e => setForm({...form, reference_type: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="manual">Manual</option>
                <option value="order">Orden de Venta</option>
                <option value="quotation">Cotizacion</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Expira</label>
              <input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Notas</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowNew(false)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Crear Reserva</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodega</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Expira</th>
                <th className="text-center px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 bg-slate-100 rounded-lg animate-pulse" /></td></tr>)
              ) : filtered.map(r => {
                const st = statusMap[r.status] || statusMap.active;
                return (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-slate-900">{r.product?.name} <span className="text-slate-400 ml-1">({r.product?.sku})</span></td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.warehouse?.name}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-slate-900">{r.quantity}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{r.reference_type || 'manual'}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">
                      {r.expires_at ? new Date(r.expires_at).toLocaleDateString('es-CL') : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${st.bg} ${st.text} border ${st.border}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {r.status === 'active' && (
                          <button onClick={() => handleRelease(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Liberar">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No hay reservas de stock</div>}
        </div>
      </div>
    </div>
  );
}
