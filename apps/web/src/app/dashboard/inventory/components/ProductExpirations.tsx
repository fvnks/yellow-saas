'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Plus, Trash2, XCircle, CheckCircle, Calendar, Package, X } from 'lucide-react';
import { toast } from 'sonner';

interface Expiration {
  id: string;
  product_name: string;
  sku: string;
  warehouse_name: string;
  batch_number: string;
  quantity: number;
  expiration_date: string;
  status: string;
  notes: string;
}

export default function ProductExpirations() {
  const [items, setItems] = useState<Expiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [expired, setExpired] = useState(0);
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', batch_number: '', quantity: 1, expiration_date: '', notes: '' });

  useEffect(() => { loadData(); loadProducts(); loadWarehouses(); }, []);

  const loadData = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/product-expirations`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setItems(data.items || []);
        setExpiringSoon(data.expiringSoon || 0);
        setExpired(data.expired || 0);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products?limit=200`);
      if (res.ok) { const json = await res.json(); setProducts(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const loadWarehouses = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/warehouses`);
      if (res.ok) { const json = await res.json(); setWarehouses(Array.isArray(json.data) ? json.data : []); }
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.product_id || !form.warehouse_id || !form.expiration_date) {
      toast.error('Complete todos los campos requeridos'); return;
    }
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/product-expirations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Registro creado');
        setShowCreate(false);
        setForm({ product_id: '', warehouse_id: '', batch_number: '', quantity: 1, expiration_date: '', notes: '' });
        loadData();
      }
    } catch (e) { toast.error('Error al crear'); }
  };

  const handleDispose = async (id: string) => {
    if (!confirm('Marcar como disponido?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/product-expirations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disposed' }),
      });
      toast.success('Producto disponido');
      loadData();
    } catch (e) { toast.error('Error'); }
  };

  const getDaysUntilExpiry = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Vencimientos</span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Registrar
        </button>
      </div>

      {(expiringSoon > 0 || expired > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {expired > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-lg font-bold text-red-700">{expired}</p>
                <p className="text-[9px] text-red-600">Vencidos</p>
              </div>
            </div>
          )}
          {expiringSoon > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-lg font-bold text-amber-700">{expiringSoon}</p>
                <p className="text-[9px] text-amber-600">Por vencer (90 dias)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Registrar Vencimiento</span>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Producto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Bodega...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <input type="text" value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Lote (opcional)" />
            <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              min={1} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="date" value={form.expiration_date} onChange={e => setForm({ ...form, expiration_date: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Notas" />
          </div>
          <button onClick={handleCreate}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Registrar
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Sin vencimientos registrados</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map(item => {
            const daysLeft = getDaysUntilExpiry(item.expiration_date);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = daysLeft >= 0 && daysLeft <= 90;

            return (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                isExpired ? 'bg-red-50 border-red-200' : isExpiringSoon ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    <Calendar className={`w-4 h-4 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-[9px] text-slate-500">{item.sku} | {item.warehouse_name}{item.batch_number ? ` | Lote: ${item.batch_number}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isExpired ? 'text-red-700' : isExpiringSoon ? 'text-amber-700' : 'text-slate-900'}`}>
                      {new Date(item.expiration_date).toLocaleDateString('es-CL')}
                    </p>
                    <p className={`text-[9px] font-semibold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-500'}`}>
                      {isExpired ? `Vencido hace ${Math.abs(daysLeft)} dias` : `${daysLeft} dias restantes`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{item.quantity}</p>
                    <p className="text-[9px] text-slate-500">unidades</p>
                  </div>
                  {item.status === 'active' && (
                    <button onClick={() => handleDispose(item.id)}
                      className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[9px] font-semibold hover:bg-emerald-200 transition-colors">
                      Disponer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
